# Programa de Formação — HI Tecnologia

Site estático (HTML/CSS/JS puro, sem build, sem frameworks) usado como portal
da jornada de formação técnica do Suporte Técnico da HI Tecnologia. Reúne,
em uma página inicial, as 15 etapas do programa, cada uma linkando para uma
página de conteúdo específica dentro de `Assets/`.

Não há backend: os "conteúdos" das aulas (PDFs, apostilas, provas) ficam
hospedados no OneDrive/Google Drive da empresa e são apenas linkados a
partir das páginas HTML.

---

## 1. Estrutura de pastas

```
Forma-o-HI/
├── index.html                    ← página principal (home / índice das 15 etapas)
├── README.md
└── Assets/
    ├── responsive.css            ← CSS de responsividade compartilhado (todas as páginas)
    ├── busca-conteudo.js         ← busca da home dentro do conteúdo das etapas
    ├── fundamentos.html          ← Etapa 1
    ├── HIstudio.html             ← Etapa 2
    ├── telemetria.html           ← Etapa 3
    ├── spdsw.html                ← Etapa 4
    ├── postgre_sql.html          ← Etapa 5
    ├── HIscadapro.html           ← Etapa 6
    ├── atendimento_ao_cliente.html ← Etapa 7
    ├── mqtt.html                 ← Etapa 8
    ├── gtonC_e_esc.html          ← Etapa 9
    ├── gtonM.html                ← Etapa 10
    ├── gtonP.html                ← Etapa 11
    ├── ihm_touch.html            ← Etapa 12
    ├── ihm_alfanumerica.html     ← Etapa 13
    ├── radios.html               ← Etapa 14
    ├── etapa_final.html          ← Etapa 15 (conclusão / desafios)
    ├── projetos.html             ← "Parte 2", projetos práticos linkados a partir da etapa_final
    └── Files/                    ← imagens usadas nas páginas acima (uma por página, ver seção 4)
```

> **Atenção:** o site é publicado no GitHub Pages, que diferencia
> maiúsculas/minúsculas. Os nomes de arquivo devem ser usados exatamente
> como estão (ex.: `HIscadapro.html`, `Files/HIscadaPRO.png`,
> `Files/SPDSW.PNG`, `gtonC_e_esc.html`).

---

## 2. Como o site funciona (fluxo de navegação)

1. O usuário abre **`index.html`**. Essa é a única página que
   fica "fora" da pasta `Assets` — todas as outras 16 páginas ficam dentro
   dela.
2. Essa página tem:
   - Um **Hero** de boas-vindas com imagem e vídeos de introdução.
   - Uma seção **Introdução ao Departamento**.
   - A seção **Fases da Formação**, que é a mais importante: contém uma
     barra de ferramentas (busca + botões "Abrir todas" / "Fechar todas")
     e um grid com **15 cards**, um por etapa. Cada card é um
     accordion (abre/fecha em CSS puro, usando `<input type="checkbox">`
     + `<label>`, sem JavaScript) e tem um botão **"Acesso ao Conteúdo"**
     que aponta para o arquivo correspondente dentro de `Assets/`.
3. Cada página de `Assets/*.html` é independente: tem seu próprio
   `<head>`/`<style>` (o CSS visual é próprio de cada arquivo; só a
   responsividade é compartilhada via `Assets/responsive.css` — ver seção 5), mostra o conteúdo daquela etapa
   (lista de materiais, links para OneDrive/Google Drive/vídeos, links para
   a prova) e termina com a barra de navegação (`.etapa-nav`): botão
   **"Voltar"** para `../index.html` e botões **etapa anterior / próxima
   etapa** (a Etapa 1 não tem anterior; a Etapa 15 não tem próxima).
4. A **Etapa 15** (`etapa_final.html`) é diferente: além de concluir o
   programa, ela linka para `projetos.html`, uma segunda página ("Parte 2")
   com desafios/projetos práticos finais. `projetos.html` tem, ao final da
   lista de projetos, links de volta para a Etapa 15 e para a página inicial.
5. **Progresso do aluno** (`Assets/progresso.js`, carregado pela home e
   pelas 15 etapas): cada etapa tem, acima da `.etapa-nav`, o botão
   **"Marcar etapa como concluída"** (`.btn-concluir[data-etapa="N"]`).
   A marcação fica salva no `localStorage` do navegador (chave
   `formacaoHI.etapasConcluidas`) e a home mostra o painel
   **"X de 15 etapas concluídas"** com barra, botão "Zerar progresso" e o
   selo **✓ Concluída** nos cards. Não há servidor: o progresso vale só
   para aquele navegador.
6. **Busca no conteúdo** (`Assets/busca-conteudo.js`, carregado só pela
   home): na primeira vez que a pesquisa é usada, a home lê as páginas das
   15 etapas (os blocos `.step` de cada uma). A partir de 2 letras, mostra
   o painel `#buscaConteudo` com os passos que contêm o termo (ignora
   acentos e maiúsculas) e mantém visíveis os cards dessas etapas. Cada
   resultado abre a etapa já rolada até o título do passo (Text Fragment
   `#:~:text=`). Não há índice para manter: um passo novo entra na busca
   automaticamente, desde que esteja dentro de um `.step` com `<h3>`.
   Aberto como arquivo local (`file://`), o navegador bloqueia essa leitura
   e a busca volta a filtrar só pelo texto dos cards.

### Mapa completo Etapa → Arquivo

| Etapa | Título                                             | Arquivo (`Assets/`)         |
|------:|-----------------------------------------------------|------------------------------|
| 1     | Fundamentos da Automação Industrial                  | `fundamentos.html`           |
| 2     | Programação de CLPs no ambiente HIstudio             | `HIstudio.html`              |
| 3     | Portal de Telemetria — Supervisório em Nuvem         | `telemetria.html`            |
| 4     | Programação de CLPs no ambiente SPDSW                | `spdsw.html`                 |
| 5     | Banco de Dados PostgreSQL                            | `postgre_sql.html`           |
| 6     | HIscada Pro — Sistema de Supervisão Local            | `HIscadapro.html`            |
| 7     | Atendimento ao Cliente e Rotinas do Suporte          | `atendimento_ao_cliente.html` |
| 8     | Protocolo MQTT para aplicações IoT                   | `mqtt.html`                  |
| 9     | Gateways GTON C SET e ESC717                         | `gtonC_e_esc.html`           |
| 10    | Modem Industrial GTON M e suas aplicações            | `gtonM.html`                 |
| 11    | Gateway programável GTON P                           | `gtonP.html`                 |
| 12    | IHMs Touch Screen Weintek e IHM GTI5                 | `ihm_touch.html`             |
| 13    | IHMs Alfanuméricas HI Tecnologia                     | `ihm_alfanumerica.html`      |
| 14    | Comunicação Wireless utilizando Rádios               | `radios.html`                |
| 15    | Conclusão do programa e Desafios                     | `etapa_final.html`           |
| —     | Projetos práticos (Parte 2, linkada pela Etapa 15)   | `projetos.html`              |

---

## 3. Padrão de código de cada página

### 3.1 Página inicial (`index.html`)
- CSS com variáveis (`:root { --azul-hi; --laranja-hi; ... }`), grid
  responsivo (`.grid-container` com `auto-fit`/`minmax`), cards com
  accordion via CSS puro.
- JavaScript (uma única `<script>` no final do `<body>`, IIFE) responsável
  por 4 comportamentos:
  - **Busca** (`#stageSearch`): filtra os cards de etapa pelo texto digitado
    (e, com `Assets/busca-conteudo.js`, pelo conteúdo das etapas).
  - **Abrir todas / Fechar todas** (`#openStages` / `#closeStages`): marca/
    desmarca todos os checkboxes dos accordions visíveis.
  - **Botão "Voltar ao topo"** (`#backToTop`): aparece após rolar 450px.
  - `updateStages()` roda uma vez na inicialização.

### 3.2 Páginas de conteúdo (`Assets/*.html`)
Seguem (com pequenas variações visuais) o mesmo esqueleto:
1. `<head>` com `<style>` próprio (paleta de cores redeclarada, quase
   idêntica à da home).
2. `<header>` simples com o título "HI Tecnologia".
3. `<section class="hero">` com título da etapa, texto explicativo e uma
   imagem (`Files/<algo>.png|jpg`).
4. `<section class="section">` com o conteúdo prático da etapa: geralmente
   dividido em blocos `.step` (ex.: "1. Leitura de Documentos",
   "2. Avaliação Prática"), cada um com botões (`.btn`, `.btn-secondary`)
   que apontam para links externos (OneDrive, Google Drive, YouTube).
5. Barra `.etapa-nav` com **"Voltar"** (`../index.html`) e os botões de
   etapa anterior / próxima etapa (estilo em `Assets/responsive.css`).
6. `<footer>` com o aviso de copyright.

`etapa_final.html` e `projetos.html` seguem essa mesma lógica, mas com
layout mais elaborado (múltiplas seções, botão "voltar ao topo" próprio,
etc.), pois concentram o encerramento do programa.

---

## 4. Imagens (`Assets/Files/`)

| Arquivo                | Usado em                     |
|-------------------------|-------------------------------|
| `Formacao.png`          | `index.html` (hero)           |
| `Fundamentos.png`       | `fundamentos.html`            |
| `HIstudio.png`          | `HIstudio.html`               |
| `portal.png`            | `telemetria.html`             |
| `SPDSW.PNG`             | `spdsw.html` (extensão em maiúsculas) |
| `Postgresql.png`        | `postgre_sql.html`            |
| `HIscadaPRO.png`        | `HIscadapro.html`             |
| `AtendimentoAoCliente.png` | `atendimento_ao_cliente.html` |
| `mqtt-logo.png`         | `mqtt.html`                   |
| `GTON-C.png`            | `gtonC_e_esc.html`            |
| `GTON-M.png`            | `gtonM.html`                  |
| `GTON-P.jpg`            | `gtonP.html`                  |
| `IHM_GTI5.png`          | `ihm_touch.html`              |
| `MMI700.png`            | `ihm_alfanumerica.html`       |
| `radio.png`             | `radios.html`                 |
| `ParteFinal.jpg`        | `etapa_final.html`            |
| `HILINO.png`            | `projetos.html`               |
| `Aprendizado.jpg`       | **não utilizada** (arquivo órfão) |

---

## 5. Como fazer manutenção

### Editar o texto/links de uma etapa existente
Abra o arquivo correspondente em `Assets/` (ver tabela da seção 2) e edite
o texto ou os links dentro dos blocos `.step`. Não é necessário mexer na
página inicial.

### Criar uma nova etapa (ex.: Etapa 16)
1. **Duplique** um arquivo existente parecido em `Assets/` (ex.: copie
   `fundamentos.html` para `nova_etapa.html`) e ajuste: `<title>`, o `<h1>`
   do hero, o texto e os links de conteúdo/prova, e a imagem em
   `Files/` (adicione a nova imagem em `Assets/Files/`).
2. Confirme que o link **"Voltar"** continua apontando para
   `../index.html` e ajuste os botões de etapa anterior/próxima na
   `.etapa-nav` da nova página e das etapas vizinhas.
3. Na página principal (`index.html`), dentro da seção
   **"Fases da Formação"**, copie um bloco `<!-- ETAPA N --> ... <div class="card">...</div>` inteiro, cole antes do fechamento do
   `.grid-container` das etapas, e ajuste:
   - o `id` do checkbox (`id="etapa16"`, deve ser único),
   - o `for` do `<label>` correspondente,
   - o título `<h3>`,
   - o texto de `.card-content`,
   - o `href` do botão para `Assets/nova_etapa.html`.
4. Atualize o contador estático "15 etapas" próximo ao campo de busca (o
   JS recalcula o número exibido dinamicamente durante buscas, mas o
   texto inicial é fixo no HTML).
5. Não é necessário alterar o `<script>` — ele seleciona os cards
   automaticamente via `.formation-tools ~ .grid-container .card`, então
   qualquer novo card dentro do mesmo grid já é filtrado/aberto/fechado
   junto com os demais.

### Trocar/gerenciar links de conteúdo (OneDrive, Google Drive, vídeos)
Os materiais (PDFs, provas, vídeos) **não ficam no projeto** — são apenas
links `<a href="https://1drv.ms/...">` ou `https://docs.google.com/...`
para arquivos hospedados fora do site. Para atualizar um material, basta
trocar a URL do link na página da etapa correspondente; não é preciso
subir arquivo novo neste projeto.

### Estilo visual
Cada página tem seu próprio bloco `<style>` no `<head>`, com variáveis de
cor bem parecidas (`--azul-hi: #004A8F`, `--laranja-hi: #F26522`, etc.).
O único CSS compartilhado é `Assets/responsive.css`, carregado por todas as
17 páginas depois dos estilos locais: ele cuida da responsividade
(tablet/mobile) e do estilo da barra `.etapa-nav`. Para mudar a identidade
visual (cores, fontes) de forma consistente, ainda é necessário editar o
`<style>` de cada arquivo HTML.

---

## 6. Problemas conhecidos / pontos de atenção

- **CSS visual duplicado**: o CSS de cada página está no próprio HTML
  (só a responsividade é compartilhada em `Assets/responsive.css`).
  Qualquer mudança visual "global" (ex.: trocar a cor institucional) exige
  editar arquivo por arquivo. Não há JS compartilhado.
- **Maiúsculas/minúsculas nos nomes de arquivo**: o GitHub Pages diferencia
  caixa. As referências atuais batem com os arquivos (`Files/HIscadaPRO.png`,
  `Files/SPDSW.PNG`); ao renomear ou adicionar arquivos, mantenha a grafia
  exata nos `href`/`src`.
- **Imagem órfã**: `Assets/Files/Aprendizado.jpg` não é referenciada em
  nenhuma página — pode ser removida com segurança ou pode ter sido
  reservada para um uso futuro.
- **Contador de etapas fixo**: o texto "15 etapas" ao lado da busca é
  estático no HTML; ele não se atualiza sozinho se você adicionar/remover
  etapas (a busca em si recalcula o total de resultados filtrados, mas o
  valor inicial exibido antes de qualquer busca precisa ser editado à mão).
- **Sem backend/CMS**: qualquer atualização de conteúdo é feita editando o
  HTML diretamente; não há painel administrativo.

---

## 7. Resumo rápido para quem só quer editar

- Quero mudar o texto de uma etapa → edite o arquivo dela em `Assets/`.
- Quero trocar um link de material/prova → edite o `href` do botão na
  página daquela etapa.
- Quero adicionar uma etapa nova → siga a seção "Criar uma nova etapa"
  acima (duplicar página + adicionar card na home).
- Quero mudar a cor/identidade visual → edite o bloco `<style>` em cada
  arquivo HTML (o único CSS central é `Assets/responsive.css`, só de
  responsividade).
