/* =========================================================
   LOGIN DO COLABORADOR — PROGRAMA DE FORMAÇÃO HI
   Usa o Supabase (Auth + tabela "progresso") pela API REST,
   sem biblioteca extra. Configuração em Assets/config-conta.js.
   - Sem configuração: não faz nada (site como antes).
   - Com configuração: pede login (e-mail e senha) para usar
     o portal e grava na conta as etapas concluídas, a última
     etapa aberta e a data do último acesso.
   - Progresso que já estava no navegador (antes do login)
     é somado à conta no primeiro login: ninguém perde nada.
   - window.FormacaoHIConta: usado pelo Assets/admin.html.
========================================================= */

(function () {

    var cfg = window.FORMACAO_HI_SUPABASE || {};
    var URL_BASE = String(cfg.url || "").replace(/\/+$/, "");
    var CHAVE_API = String(cfg.anonKey || "");

    if (!URL_BASE || !CHAVE_API) {
        return;
    }

    var CH_SESSAO = "formacaoHI.sessao";
    var CH_DONO = "formacaoHI.dono";
    var CH_PENDENTE = "formacaoHI.pendente";

    var paginaAdmin = window.FORMACAO_HI_PAGINA_ADMIN === true;
    var progresso = window.FormacaoHIProgresso || null;
    var botaoEtapa = document.querySelector(".btn-concluir[data-etapa]");
    var etapaDaPagina = botaoEtapa ? Number(botaoEtapa.getAttribute("data-etapa")) : null;

    var sessao = null;
    var logado = false;
    var renovando = null;
    var aoEntrar = [];


    /* -----------------------------------------------------
       ARMAZENAMENTO LOCAL
    ----------------------------------------------------- */

    function lerLocal(chave) {
        try {
            return localStorage.getItem(chave);
        } catch (e) {
            return null;
        }
    }

    function gravarLocal(chave, valor) {
        try {
            if (valor === null) {
                localStorage.removeItem(chave);
            } else {
                localStorage.setItem(chave, valor);
            }
        } catch (e) {
            /* sem localStorage: vale só nesta página */
        }
    }

    function carregarSessao() {
        try {
            var s = JSON.parse(lerLocal(CH_SESSAO) || "null");
            return s && s.access_token && s.refresh_token && s.user ? s : null;
        } catch (e) {
            return null;
        }
    }

    function guardarSessao(resp) {
        var u = resp.user || {};
        var meta = u.user_metadata || {};
        sessao = {
            access_token: resp.access_token,
            refresh_token: resp.refresh_token,
            expires_at: resp.expires_at || (Math.floor(Date.now() / 1000) + (resp.expires_in || 3600)),
            user: {
                id: u.id,
                email: u.email || "",
                nome: meta.nome || (sessao && sessao.user.nome) || ""
            }
        };
        gravarLocal(CH_SESSAO, JSON.stringify(sessao));
    }

    function apagarSessao() {
        sessao = null;
        gravarLocal(CH_SESSAO, null);
    }


    /* -----------------------------------------------------
       API DO SUPABASE
    ----------------------------------------------------- */

    function chamar(caminho, opcoes, token) {
        opcoes = opcoes || {};
        var cabecalhos = {
            "apikey": CHAVE_API,
            "Content-Type": "application/json"
        };
        if (token) {
            cabecalhos["Authorization"] = "Bearer " + token;
        }
        Object.keys(opcoes.headers || {}).forEach(function (k) {
            cabecalhos[k] = opcoes.headers[k];
        });

        return fetch(URL_BASE + caminho, {
            method: opcoes.method || "GET",
            headers: cabecalhos,
            body: opcoes.body ? JSON.stringify(opcoes.body) : undefined
        }).then(function (r) {
            return r.text().then(function (txt) {
                var dados = null;
                try { dados = txt ? JSON.parse(txt) : null; } catch (e) { dados = txt; }
                if (!r.ok) {
                    var erro = new Error(
                        (dados && (dados.msg || dados.error_description || dados.message || dados.error)) ||
                        ("Erro " + r.status)
                    );
                    erro.status = r.status;
                    erro.codigo = dados && (dados.error_code || dados.code);
                    throw erro;
                }
                return dados;
            });
        });
    }

    function renovar() {
        if (!renovando) {
            renovando = chamar("/auth/v1/token?grant_type=refresh_token", {
                method: "POST",
                body: { refresh_token: sessao.refresh_token }
            }).then(function (resp) {
                guardarSessao(resp);
                renovando = null;
                return sessao.access_token;
            }, function (erro) {
                renovando = null;
                if (erro.status === 400 || erro.status === 401 || erro.status === 403) {
                    apagarSessao();
                    logado = false;
                    mostrarLogin("Sua sessão expirou. Entre novamente.");
                }
                throw erro;
            });
        }
        return renovando;
    }

    function token() {
        if (!sessao) {
            return Promise.reject(new Error("Sem sessão"));
        }
        if (sessao.expires_at - 60 > Date.now() / 1000) {
            return Promise.resolve(sessao.access_token);
        }
        return renovar();
    }

    /* chamada autenticada à API REST (tabelas) */
    function rest(caminho, opcoes) {
        return token().then(function (t) {
            return chamar("/rest/v1/" + caminho, opcoes, t);
        });
    }

    function traduzirErro(erro) {
        var m = String((erro && erro.message) || "");
        if (/invalid login credentials/i.test(m)) return "E-mail ou senha incorretos.";
        if (/already registered|already been registered|user_already_exists/i.test(m + (erro.codigo || ""))) {
            return "Este e-mail já tem conta. Use a aba Entrar.";
        }
        if (/password should be at least/i.test(m)) return "A senha precisa ter pelo menos 6 caracteres.";
        if (/email not confirmed/i.test(m)) return "E-mail ainda não confirmado. Fale com o administrador.";
        if (/unable to validate email|invalid format|email address .* is invalid/i.test(m)) return "E-mail inválido.";
        if (/signups not allowed/i.test(m)) return "Criação de contas desativada. Fale com o administrador.";
        if (/rate limit|too many/i.test(m)) return "Muitas tentativas. Aguarde alguns minutos.";
        if (/failed to fetch|networkerror|load failed/i.test(m)) return "Sem conexão com o servidor. Verifique a internet.";
        return "Não foi possível concluir: " + m;
    }


    /* -----------------------------------------------------
       PROGRESSO NA CONTA
    ----------------------------------------------------- */

    function uniao(a, b) {
        var r = (a || []).slice();
        (b || []).forEach(function (n) {
            if (r.indexOf(n) === -1) r.push(n);
        });
        return r.sort(function (x, y) { return x - y; });
    }

    function enviar(campos) {
        var linha = {
            user_id: sessao.user.id,
            nome: sessao.user.nome || sessao.user.email,
            email: sessao.user.email,
            ultimo_acesso: new Date().toISOString()
        };
        Object.keys(campos).forEach(function (k) { linha[k] = campos[k]; });

        return rest("progresso?on_conflict=user_id", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
            body: [linha]
        });
    }

    function sincronizar() {
        if (paginaAdmin || !sessao) {
            return Promise.resolve();
        }
        var uid = sessao.user.id;

        return rest("progresso?select=etapas,nome&user_id=eq." + encodeURIComponent(uid))
            .then(function (linhas) {
                var linha = linhas && linhas[0];
                var servidor = (linha && linha.etapas) || [];
                var local = progresso ? progresso.ler() : [];
                var dono = lerLocal(CH_DONO);
                var lista;

                if (linha && linha.nome && !sessao.user.nome) {
                    sessao.user.nome = linha.nome;
                    gravarLocal(CH_SESSAO, JSON.stringify(sessao));
                }

                if (!dono) {
                    /* progresso de antes do login: soma com a conta */
                    lista = uniao(local, servidor);
                } else if (dono === uid && lerLocal(CH_PENDENTE)) {
                    /* alteração feita sem conexão: vale a do navegador */
                    lista = local;
                } else {
                    lista = servidor;
                }

                gravarLocal(CH_DONO, uid);
                if (progresso) progresso.definir(lista);

                var campos = { etapas: lista };
                if (etapaDaPagina) campos.ultima_etapa = etapaDaPagina;
                return enviar(campos);
            })
            .then(function () {
                gravarLocal(CH_PENDENTE, null);
            }, function () {
                gravarLocal(CH_PENDENTE, "1");
            });
    }

    if (progresso) {
        progresso.aoAlterar(function (lista) {
            if (!sessao || paginaAdmin) return;
            gravarLocal(CH_PENDENTE, "1");
            enviar({ etapas: lista }).then(function () {
                gravarLocal(CH_PENDENTE, null);
            }, function () { /* tenta de novo no próximo acesso */ });
        });
    }


    /* -----------------------------------------------------
       TELA DE LOGIN
    ----------------------------------------------------- */

    var gate = null;

    function criarLogin() {
        gate = document.createElement("div");
        gate.className = "conta-gate";
        gate.setAttribute("role", "dialog");
        gate.setAttribute("aria-modal", "true");
        gate.setAttribute("aria-labelledby", "contaTitulo");
        gate.innerHTML =
            '<div class="conta-caixa">' +
                '<p class="conta-marca">Formação HI Tecnologia</p>' +
                '<h2 id="contaTitulo">Acesse o treinamento</h2>' +
                '<div class="conta-abas" role="tablist">' +
                    '<button type="button" role="tab" class="conta-aba ativa" data-modo="entrar" aria-selected="true">Entrar</button>' +
                    '<button type="button" role="tab" class="conta-aba" data-modo="criar" aria-selected="false">Criar conta</button>' +
                '</div>' +
                '<form class="conta-form" novalidate>' +
                    '<label class="conta-campo conta-campo-nome" hidden>Nome completo' +
                        '<input type="text" name="nome" autocomplete="name" maxlength="80">' +
                    '</label>' +
                    '<label class="conta-campo">E-mail' +
                        '<input type="email" name="email" autocomplete="email" required>' +
                    '</label>' +
                    '<label class="conta-campo">Senha' +
                        '<input type="password" name="senha" autocomplete="current-password" minlength="6" required>' +
                    '</label>' +
                    '<p class="conta-msg" role="alert" hidden></p>' +
                    '<button type="submit" class="btn conta-enviar">Entrar</button>' +
                '</form>' +
                '<p class="conta-aviso">Seu nome, e-mail, as etapas concluídas e a data do último acesso ficam ' +
                'registrados para o acompanhamento do treinamento pela HI Tecnologia. ' +
                'O progresso que você já marcou neste navegador é mantido.</p>' +
            '</div>';
        document.body.appendChild(gate);

        var form = gate.querySelector(".conta-form");
        var campoNome = gate.querySelector(".conta-campo-nome");
        var inputNome = form.elements.nome;
        var inputSenha = form.elements.senha;
        var enviarBtn = gate.querySelector(".conta-enviar");
        var modo = "entrar";

        Array.prototype.forEach.call(gate.querySelectorAll(".conta-aba"), function (aba) {
            aba.addEventListener("click", function () {
                modo = aba.getAttribute("data-modo");
                Array.prototype.forEach.call(gate.querySelectorAll(".conta-aba"), function (a) {
                    var ativa = a === aba;
                    a.classList.toggle("ativa", ativa);
                    a.setAttribute("aria-selected", ativa ? "true" : "false");
                });
                campoNome.hidden = modo !== "criar";
                inputSenha.setAttribute("autocomplete", modo === "criar" ? "new-password" : "current-password");
                enviarBtn.textContent = modo === "criar" ? "Criar conta" : "Entrar";
                mensagem("");
            });
        });

        form.addEventListener("submit", function (ev) {
            ev.preventDefault();
            var nome = inputNome.value.trim();
            var email = form.elements.email.value.trim().toLowerCase();
            var senha = inputSenha.value;

            if (modo === "criar" && nome.length < 3) return mensagem("Informe seu nome completo.");
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return mensagem("Informe um e-mail válido.");
            if (senha.length < 6) return mensagem("A senha precisa ter pelo menos 6 caracteres.");

            enviarBtn.disabled = true;
            enviarBtn.textContent = "Aguarde…";
            mensagem("");

            var pedido = modo === "criar"
                ? chamar("/auth/v1/signup", { method: "POST", body: { email: email, password: senha, data: { nome: nome } } })
                : chamar("/auth/v1/token?grant_type=password", { method: "POST", body: { email: email, password: senha } });

            pedido.then(function (resp) {
                if (!resp || !resp.access_token) {
                    throw new Error("Conta criada, mas o acesso ainda não foi liberado (confirmação de e-mail ativa). Fale com o administrador.");
                }
                guardarSessao(resp);
                if (modo === "criar" && !sessao.user.nome) sessao.user.nome = nome;
                form.reset();
                entrou();
            }).catch(function (erro) {
                mensagem(/Conta criada/.test(erro.message) ? erro.message : traduzirErro(erro));
            }).then(function () {
                enviarBtn.disabled = false;
                enviarBtn.textContent = modo === "criar" ? "Criar conta" : "Entrar";
            });
        });
    }

    function mensagem(txt) {
        var p = gate && gate.querySelector(".conta-msg");
        if (!p) return;
        p.textContent = txt;
        p.hidden = !txt;
    }

    function mostrarLogin(txt) {
        if (!gate) criarLogin();
        gate.hidden = false;
        document.documentElement.classList.add("conta-bloqueada");
        mensagem(txt || "");
        removerUsuario();
        var campo = gate.querySelector('input[name="email"]');
        if (campo) setTimeout(function () { campo.focus(); }, 50);
    }

    function esconderLogin() {
        if (gate) gate.hidden = true;
        document.documentElement.classList.remove("conta-bloqueada");
    }


    /* -----------------------------------------------------
       "CONECTADO COMO" + SAIR
    ----------------------------------------------------- */

    function removerUsuario() {
        Array.prototype.forEach.call(document.querySelectorAll(".conta-usuario"), function (el) {
            el.remove();
        });
    }

    function mostrarUsuario() {
        removerUsuario();
        var p = document.createElement("p");
        p.className = "conta-usuario";
        p.appendChild(document.createTextNode("Conectado como "));
        var b = document.createElement("strong");
        b.textContent = sessao.user.nome || sessao.user.email;
        p.appendChild(b);
        p.appendChild(document.createTextNode(" · "));
        var sair = document.createElement("button");
        sair.type = "button";
        sair.className = "conta-sair";
        sair.textContent = "Sair";
        sair.addEventListener("click", function () {
            var t = sessao && sessao.access_token;
            if (t) chamar("/auth/v1/logout", { method: "POST" }, t).catch(function () {});
            apagarSessao();
            logado = false;
            mostrarLogin();
        });
        p.appendChild(sair);

        var dica = document.querySelector(".progresso-dica");
        if (dica) {
            dica.textContent = "Marque cada etapa como concluída no final da página dela. O progresso fica salvo na sua conta.";
        }

        var lugar = document.querySelector(".progresso-formacao") ||
            document.querySelector(".etapa-concluir") ||
            document.querySelector(".conta-lugar");
        if (lugar) {
            lugar.appendChild(p);
        } else {
            var rodape = document.querySelector("footer");
            p.classList.add("conta-usuario-solta");
            document.body.insertBefore(p, rodape || null);
        }
    }

    function entrou() {
        logado = true;
        esconderLogin();
        mostrarUsuario();
        sincronizar();
        aoEntrar.forEach(function (fn) {
            try { fn(sessao.user); } catch (e) { /* ignora */ }
        });
    }


    /* -----------------------------------------------------
       INÍCIO
    ----------------------------------------------------- */

    window.FormacaoHIConta = {
        rest: rest,
        usuario: function () { return sessao ? sessao.user : null; },
        aoEntrar: function (fn) {
            aoEntrar.push(fn);
            if (logado) fn(sessao.user);
        }
    };

    sessao = carregarSessao();
    if (sessao) {
        token().then(entrou, function () {
            /* sem rede: segue com a sessão salva; renovar() já pede login se ela expirou */
            if (sessao) entrou();
        });
    } else {
        mostrarLogin();
    }

    /* volta pelo botão do navegador (bfcache) */
    window.addEventListener("pageshow", function (ev) {
        if (ev.persisted && sessao && !paginaAdmin) sincronizar();
    });

})();
