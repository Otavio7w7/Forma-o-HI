/* =========================================================
   MODO ESCURO — PROGRAMA DE FORMAÇÃO HI
   Carregado no <head> de todas as páginas, logo após o
   responsive.css, para aplicar o tema antes da página aparecer.
   A escolha fica salva no localStorage (chave "hi-tema").
   As cores do tema escuro ficam no Assets/responsive.css.
========================================================= */
(function () {
    "use strict";

    var CHAVE = "hi-tema";
    var raiz = document.documentElement;

    function lerTema() {
        try {
            return localStorage.getItem(CHAVE) === "escuro" ? "escuro" : "claro";
        } catch (e) {
            return "claro";
        }
    }

    function salvarTema(tema) {
        try {
            localStorage.setItem(CHAVE, tema);
        } catch (e) {
            /* Sem localStorage: o tema vale só para esta página. */
        }
    }

    function aplicarTema(tema) {
        if (tema === "escuro") {
            raiz.setAttribute("data-theme", "dark");
        } else {
            raiz.removeAttribute("data-theme");
        }

        var botoes = document.querySelectorAll(".tema-switch");
        for (var i = 0; i < botoes.length; i++) {
            botoes[i].setAttribute("aria-checked", tema === "escuro" ? "true" : "false");
        }
    }

    /* Aplica já no <head>, sem piscar o tema claro. */
    aplicarTema(lerTema());

    function criarSwitch() {
        var header = document.querySelector("header");
        if (!header || header.querySelector(".tema-switch")) return;

        var botao = document.createElement("button");
        botao.type = "button";
        botao.className = "tema-switch";
        botao.setAttribute("role", "switch");
        botao.setAttribute("aria-label", "Modo escuro");
        botao.setAttribute("title", "Alternar modo escuro");
        botao.innerHTML =
            '<span class="tema-switch-trilho" aria-hidden="true">' +
                '<span class="tema-switch-bolinha"></span>' +
            '</span>' +
            '<span class="tema-switch-rotulo">Modo escuro</span>';

        botao.addEventListener("click", function () {
            var novo = raiz.getAttribute("data-theme") === "dark" ? "claro" : "escuro";
            salvarTema(novo);
            aplicarTema(novo);
        });

        /* Home: junto do "Central de Ajuda"; Projetos: junto dos botões
           do cabeçalho; Etapa 15: junto do "Site HI Tecnologia";
           demais etapas: no fim do cabeçalho. */
        var destino =
            header.querySelector("nav") ||
            header.querySelector(".header-buttons") ||
            (header.lastElementChild && header.lastElementChild.tagName === "DIV" &&
                header.children.length > 1 ? header.lastElementChild : null) ||
            header;

        destino.appendChild(botao);
        aplicarTema(lerTema());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", criarSwitch);
    } else {
        criarSwitch();
    }

    /* Mantém abas abertas sincronizadas. */
    window.addEventListener("storage", function (evento) {
        if (evento.key === CHAVE) aplicarTema(lerTema());
    });
})();
