/* =========================================================
   PROGRESSO DO ALUNO — PROGRAMA DE FORMAÇÃO HI
   Guarda no navegador (localStorage) quais das 15 etapas
   foram marcadas como concluídas.
   - Páginas de etapa: botão .btn-concluir[data-etapa="N"]
   - Home: barra #progressoFormacao e selo nos cards #etapaN
   - window.FormacaoHIProgresso: usado pelo Assets/conta.js
     para sincronizar com a conta do colaborador
========================================================= */

(function () {

    var CHAVE = "formacaoHI.etapasConcluidas";
    var TOTAL = 15;
    var ouvintes = [];
    var botoes = [];
    var atualizarHome = null;

    function ler() {
        try {
            var lista = JSON.parse(localStorage.getItem(CHAVE) || "[]");
            return Array.isArray(lista) ? lista.map(Number).filter(function (n) {
                return n >= 1 && n <= TOTAL;
            }) : [];
        } catch (e) {
            return [];
        }
    }

    function gravar(lista) {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(lista));
        } catch (e) {
            /* navegador sem armazenamento: progresso só nesta visita */
        }
    }

    function concluida(n) {
        return ler().indexOf(n) !== -1;
    }

    function alternar(n) {
        var lista = ler();
        var pos = lista.indexOf(n);
        if (pos === -1) {
            lista.push(n);
        } else {
            lista.splice(pos, 1);
        }
        lista.sort(function (a, b) { return a - b; });
        gravar(lista);
        notificar(lista);
    }

    function notificar(lista) {
        ouvintes.forEach(function (fn) {
            try { fn(lista.slice()); } catch (e) { /* ignora */ }
        });
    }

    function atualizarTela() {
        botoes.forEach(function (b) { atualizarBotao(b.botao, b.n); });
        if (atualizarHome) {
            atualizarHome();
        }
    }

    window.FormacaoHIProgresso = {
        TOTAL: TOTAL,
        ler: ler,
        /* substitui a lista salva (sem avisar os ouvintes) */
        definir: function (lista) {
            var limpa = [];
            (lista || []).forEach(function (n) {
                n = Number(n);
                if (n >= 1 && n <= TOTAL && limpa.indexOf(n) === -1) {
                    limpa.push(n);
                }
            });
            limpa.sort(function (a, b) { return a - b; });
            gravar(limpa);
            atualizarTela();
        },
        aoAlterar: function (fn) {
            ouvintes.push(fn);
        }
    };


    /* -----------------------------------------------------
       PÁGINAS DE ETAPA
    ----------------------------------------------------- */

    function atualizarBotao(botao, n) {
        var feito = concluida(n);
        botao.classList.toggle("concluida", feito);
        botao.setAttribute("aria-pressed", feito ? "true" : "false");
        botao.textContent = feito
            ? "✓ Etapa concluída"
            : "Marcar etapa como concluída";
        botao.title = feito
            ? "Clique para desmarcar esta etapa"
            : "Registra neste navegador que você concluiu a etapa";
    }

    Array.prototype.forEach.call(
        document.querySelectorAll(".btn-concluir[data-etapa]"),
        function (botao) {
            var n = Number(botao.getAttribute("data-etapa"));
            botoes.push({ botao: botao, n: n });
            atualizarBotao(botao, n);
            botao.addEventListener("click", function () {
                alternar(n);
                atualizarBotao(botao, n);
            });
        }
    );


    /* -----------------------------------------------------
       HOME
    ----------------------------------------------------- */

    var painel = document.getElementById("progressoFormacao");

    if (!painel) {
        return;
    }

    var texto = document.getElementById("progressoTexto");
    var barra = document.getElementById("progressoBarra");
    var trilha = painel.querySelector(".progresso-trilha");
    var zerar = document.getElementById("progressoZerar");

    atualizarHome = function () {
        var lista = ler();
        var qtd = lista.length;
        var pct = Math.round((qtd / TOTAL) * 100);

        texto.textContent = qtd === TOTAL
            ? "Parabéns! Você concluiu as 15 etapas."
            : qtd + " de " + TOTAL + " etapas concluídas";
        barra.style.width = pct + "%";
        trilha.setAttribute("aria-valuenow", String(qtd));
        zerar.hidden = qtd === 0;

        for (var n = 1; n <= TOTAL; n++) {
            var check = document.getElementById("etapa" + n);
            var card = check && check.closest(".card");
            if (!card) {
                continue;
            }
            var feito = lista.indexOf(n) !== -1;
            card.classList.toggle("etapa-concluida", feito);

            var header = card.querySelector(".card-header");
            var selo = header.querySelector(".selo-concluida");
            if (feito && !selo) {
                selo = document.createElement("span");
                selo.className = "selo-concluida";
                selo.textContent = "✓ Concluída";
                header.insertBefore(selo, header.querySelector(".setinha"));
            } else if (!feito && selo) {
                selo.remove();
            }
        }
    };

    zerar.addEventListener("click", function () {
        if (window.confirm("Apagar o progresso salvo neste navegador?")) {
            gravar([]);
            atualizarHome();
            notificar([]);
        }
    });

    /* atualiza ao voltar pelo botão do navegador (bfcache) */
    window.addEventListener("pageshow", atualizarHome);

    atualizarHome();

})();
