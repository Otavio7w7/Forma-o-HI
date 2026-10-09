/* =========================================================
   BUSCA NO CONTEÚDO DAS ETAPAS — PROGRAMA DE FORMAÇÃO HI
   Na home, a pesquisa (#stageSearch) passa a procurar também
   dentro das páginas das 15 etapas (blocos .step de cada uma).
   - As páginas são lidas na primeira vez que a busca é usada
     (fetch no mesmo site; nada novo para manter).
   - Ignora acentos e maiúsculas: "conversao" acha "Conversão".
   - Os trechos encontrados aparecem em #buscaConteudo, com link
     que abre a etapa já rolada até o passo correspondente.
   - Aberto como arquivo local (file://) o navegador bloqueia a
     leitura: a busca continua só nos cards, como antes.
========================================================= */

(function () {

    var MIN_TERMO = 2;
    var MAX_RESULTADOS = 8;

    var campo = document.getElementById("stageSearch");
    var ferramentas = document.querySelector(".formation-tools");
    if (!campo || !ferramentas) return;

    /* card da home -> página da etapa */
    var etapas = Array.prototype.map.call(
        document.querySelectorAll(".formation-tools ~ .grid-container .card"),
        function (card) {
            var link = card.querySelector('a[href^="Assets/"]');
            var titulo = card.querySelector(".card-header h3");
            return {
                card: card,
                url: link ? link.getAttribute("href") : null,
                nome: titulo ? titulo.textContent.replace(/\s+/g, " ").trim() : "",
                passos: []
            };
        }
    ).filter(function (e) { return e.url; });

    var estado = "nao-carregado"; /* carregando | pronto | indisponivel */

    /* ---------- texto sem acento e minúsculo ---------- */

    function normalizarLetra(c) {
        return c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    function normalizar(texto) {
        return normalizarLetra(texto);
    }

    /* Normaliza guardando a posição original de cada letra,
       para destacar o trecho certo no texto com acento. */
    function normalizarComMapa(texto) {
        var saida = "";
        var mapa = [];
        for (var i = 0; i < texto.length; i++) {
            var n = normalizarLetra(texto[i]);
            for (var j = 0; j < n.length; j++) {
                saida += n[j];
                mapa.push(i);
            }
        }
        return { texto: saida, mapa: mapa };
    }

    function limpar(texto) {
        return (texto || "").replace(/\s+/g, " ").trim();
    }

    /* ---------- leitura das páginas ---------- */

    function lerEtapa(etapa) {
        return fetch(etapa.url)
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, "text/html");
                etapa.passos = Array.prototype.map.call(
                    doc.querySelectorAll(".step"),
                    function (passo) {
                        var h = passo.querySelector("h3");
                        var titulo = limpar(h ? h.textContent : "");
                        /* texto do passo sem o título, para o trecho */
                        var corpo = passo.cloneNode(true);
                        var hCorpo = corpo.querySelector("h3");
                        if (hCorpo) hCorpo.remove();
                        var texto = limpar(corpo.textContent);
                        return {
                            titulo: titulo,
                            texto: texto,
                            normal: normalizar(titulo + " " + texto)
                        };
                    }
                );
            });
    }

    function carregar() {
        if (estado !== "nao-carregado") return;
        estado = "carregando";
        mostrar();

        Promise.all(etapas.map(function (e) {
            return lerEtapa(e).then(
                function () { return true; },
                function () { return false; }
            );
        })).then(function (ok) {
            estado = ok.indexOf(true) === -1 ? "indisponivel" : "pronto";
            /* refaz o filtro dos cards com o conteúdo já lido */
            campo.dispatchEvent(new Event("input"));
        });
    }

    /* ---------- consulta usada pelo filtro da home ---------- */

    function etapaContem(card, termo) {
        var t = normalizar(limpar(termo));
        if (!t) return true;
        if (normalizar(card.textContent).indexOf(t) !== -1) return true;
        if (estado !== "pronto" || t.length < MIN_TERMO) return false;

        for (var i = 0; i < etapas.length; i++) {
            if (etapas[i].card !== card) continue;
            return etapas[i].passos.some(function (p) {
                return p.normal.indexOf(t) !== -1;
            });
        }
        return false;
    }

    window.buscaConteudo = { etapaContem: etapaContem };

    /* ---------- painel de resultados ---------- */

    var painel = document.createElement("div");
    painel.className = "busca-conteudo";
    painel.id = "buscaConteudo";
    painel.setAttribute("aria-live", "polite");
    painel.hidden = true;
    ferramentas.parentNode.insertBefore(painel, ferramentas.nextSibling);

    /* Link que abre a etapa rolada até o título do passo
       (Text Fragment; navegador sem suporte só abre a página). */
    function linkPasso(url, titulo) {
        if (!titulo) return url;
        var frag = encodeURIComponent(titulo).replace(/-/g, "%2D");
        return url + "#:~:text=" + frag;
    }

    function trecho(texto, termo) {
        var n = normalizarComMapa(texto);
        var pos = n.texto.indexOf(termo);
        var span = document.createElement("span");
        span.className = "busca-conteudo-trecho";
        if (pos === -1) {
            span.textContent = texto.slice(0, 140) + (texto.length > 140 ? "…" : "");
            return span;
        }

        var ini = n.mapa[pos];
        var fim = n.mapa[pos + termo.length - 1] + 1;
        var de = Math.max(0, ini - 60);
        var ate = Math.min(texto.length, fim + 90);

        /* não corta palavra no meio */
        if (de > 0) {
            var esp = texto.indexOf(" ", de);
            if (esp !== -1 && esp < ini) de = esp + 1;
        }
        if (ate < texto.length) {
            var espFim = texto.lastIndexOf(" ", ate);
            if (espFim > fim) ate = espFim;
        }

        var marca = document.createElement("mark");
        marca.textContent = texto.slice(ini, fim);
        span.appendChild(document.createTextNode((de > 0 ? "…" : "") + texto.slice(de, ini)));
        span.appendChild(marca);
        span.appendChild(document.createTextNode(texto.slice(fim, ate) + (ate < texto.length ? "…" : "")));
        return span;
    }

    function mostrar() {
        var termo = normalizar(limpar(campo.value));
        painel.innerHTML = "";

        if (termo.length < MIN_TERMO || estado === "indisponivel" || estado === "nao-carregado") {
            painel.hidden = true;
            return;
        }

        painel.hidden = false;

        if (estado === "carregando") {
            var aviso = document.createElement("p");
            aviso.className = "busca-conteudo-titulo";
            aviso.textContent = "Procurando no conteúdo das etapas…";
            painel.appendChild(aviso);
            return;
        }

        var achados = [];
        etapas.forEach(function (e) {
            e.passos.forEach(function (p) {
                if (p.normal.indexOf(termo) !== -1) {
                    achados.push({ etapa: e, passo: p });
                }
            });
        });

        var titulo = document.createElement("p");
        titulo.className = "busca-conteudo-titulo";
        titulo.textContent = achados.length === 0
            ? "Nada encontrado dentro das etapas."
            : "Encontrado em " + achados.length +
              (achados.length === 1 ? " trecho" : " trechos") +
              " do conteúdo das etapas:";
        painel.appendChild(titulo);

        if (achados.length === 0) return;

        var lista = document.createElement("ul");
        lista.className = "busca-conteudo-lista";

        achados.slice(0, MAX_RESULTADOS).forEach(function (a) {
            var item = document.createElement("li");
            var link = document.createElement("a");
            link.href = linkPasso(a.etapa.url, a.passo.titulo);

            var onde = document.createElement("span");
            onde.className = "busca-conteudo-etapa";
            onde.textContent = a.etapa.nome;

            var passo = document.createElement("strong");
            passo.textContent = a.passo.titulo || "Conteúdo da etapa";

            link.appendChild(onde);
            link.appendChild(passo);
            link.appendChild(trecho(a.passo.texto, termo));
            item.appendChild(link);
            lista.appendChild(item);
        });

        painel.appendChild(lista);

        if (achados.length > MAX_RESULTADOS) {
            var mais = document.createElement("p");
            mais.className = "busca-conteudo-mais";
            mais.textContent = "+ " + (achados.length - MAX_RESULTADOS) +
                " trechos. Refine a pesquisa para ver menos resultados.";
            painel.appendChild(mais);
        }
    }

    campo.addEventListener("focus", carregar);
    campo.addEventListener("input", function () {
        carregar();
        mostrar();
    });

})();
