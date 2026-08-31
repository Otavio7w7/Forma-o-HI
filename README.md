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
Programa de Formação/
├── Acesso ao conteúdo.html      ← página principal (home / índice das 15 etapas)
└── Assets/
    ├── Fundamentos.html         ← Etapa 1
    ├── HIstudio.html            ← Etapa 2
    ├── Telemetria.html          ← Etapa 3
    ├── SPDSW.html               ← Etapa 4
    ├── PostgreSQL.html          ← Etapa 5
    ├── HIscadaPRO.html          ← Etapa 6
    ├── AtendimentoAoCliente.html← Etapa 7
    ├── MQTT.html                ← Etapa 8
    ├── gtoncEesc.html           ← Etapa 9
    ├── gtonM.html               ← Etapa 10
    ├── gtonP.html               ← Etapa 11
    ├── ihmsTOUCH.html           ← Etapa 12
    ├── ihmsALFA.html            ← Etapa 13
    ├── Rádios.html              ← Etapa 14
    ├── etapaFINAL.html          ← Etapa 15 (conclusão / desafios)
    ├── projetos.html            ← "Parte 2", projetos práticos linkados a partir da etapaFINAL
    └── Files/                   ← imagens usadas nas páginas acima (uma por página, ver seção 4)
```

> **Atenção:** vários nomes de arquivo e pasta têm acentos (`Formação`,
> `conteúdo`, `Rádios`). Isso funciona normalmente no Windows/OneDrive, mas
> pode causar problemas se o projeto for movido para um servidor Linux
> sensível a maiúsculas/minúsculas e a encoding (ver seção 6 — Problemas
> conhecidos).

---

## 2. Como o site funciona (fluxo de navegação)

1. O usuário abre **`Acesso ao conteúdo.html`**. Essa é a única página que
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
   `<head>`/`<style>` (o CSS **não é compartilhado** entre páginas, é
   duplicado em cada arquivo — ver seção 5), mostra o conteúdo daquela etapa
   (lista de materiais, links para OneDrive/Google Drive/vídeos, links para
   a prova) e termina com um botão **"Voltar"** que aponta de volta para
   `../Acesso ao conteúdo.html`.
4. A **Etapa 15** (`etapaFINAL.html`) é diferente: além de concluir o
   programa, ela linka para `projetos.html`, uma segunda página ("Parte 2")
   com desafios/projetos práticos finais.

### Mapa completo Etapa → Arquivo

| Etapa | Título                                             | Arquivo (`Assets/`)         |
|------:|-----------------------------------------------------|------------------------------|
| 1     | Fundamentos da Automação Industrial                  | `Fundamentos.html`           |
| 2     | Programação de CLPs no ambiente HIstudio             | `HIstudio.html`              |
| 3     | Portal de Telemetria — Supervisório em Nuvem         | `Telemetria.html`            |
| 4     | Programação de CLPs no ambiente SPDSW                | `SPDSW.html`                 |
| 5     | Banco de Dados PostgreSQL                            | `PostgreSQL.html`            |
| 6     | HIscada Pro — Sistema de Supervisão Local            | `HIscadaPRO.html`            |
| 7     | Atendimento ao Cliente e Rotinas do Suporte          | `AtendimentoAoCliente.html`  |
| 8     | Protocolo MQTT para aplicações IoT                   | `MQTT.html`                  |
| 9     | Gateways GTON C SET e ESC717                         | `gtoncEesc.html`             |
| 10    | Modem Industrial GTON M e suas aplicações            | `gtonM.html`                 |
| 11    | Gateway programável GTON P                           | `gtonP.html`                 |
| 12    | IHMs Touch Screen Weintek e IHM GTI5                 | `ihmsTOUCH.html`             |
| 13    | IHMs Alfanuméricas HI Tecnologia                     | `ihmsALFA.html`              |
| 14    | Comunicação Wireless utilizando Rádios               | `Rádios.html`                |
| 15    | Conclusão do programa e Desafios                     | `etapaFINAL.html`            |
| —     | Projetos práticos (Parte 2, linkada pela Etapa 15)   | `projetos.html`              |

---

## 3. Padrão de código de cada página

### 3.1 Página inicial (`Acesso ao conteúdo.html`)
- CSS com variáveis (`:root { --azul-hi; --laranja-hi; ... }`), grid
  responsivo (`.grid-container` com `auto-fit`/`minmax`), cards com
  accordion via CSS puro.
- JavaScript (uma única `<script>` no final do `<body>`, IIFE) responsável
  por 4 comportamentos:
  - **Busca** (`#stageSearch`): filtra os cards de etapa pelo texto digitado.
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
5. Um link **"Voltar"** para `../Acesso ao conteúdo.html`.
6. `<footer>` com o aviso de copyright.

`etapaFINAL.html` e `projetos.html` seguem essa mesma lógica, mas com
layout mais elaborado (múltiplas seções, botão "voltar ao topo" próprio,
etc.), pois concentram o encerramento do programa.

---

## 4. Imagens (`Assets/Files/`)

| Arquivo                | Usado em                     |
|-------------------------|-------------------------------|
| `Formacao.png`          | `Acesso ao conteúdo.html` (hero) |
| `Fundamentos.png`       | `Fundamentos.html`            |
| `HIstudio.png`          | `HIstudio.html`               |
| `portal.png`            | `Telemetria.html`             |
| `SPDSW.PNG`             | `SPDSW.html` *(ver aviso abaixo)* |
| `Postgresql.png`        | `PostgreSQL.html`             |
| `HIscadaPRO.png`        | `HIscadaPRO.html` *(ver aviso abaixo)* |
| `AtendimentoAoCliente.png` | `AtendimentoAoCliente.html` |
| `mqtt-logo.png`         | `MQTT.html`                   |
| `GTON-C.png`            | `gtoncEesc.html`               |
| `GTON-M.png`            | `gtonM.html`                  |
| `GTON-P.jpg`            | `gtonP.html`                  |
| `IHM_GTI5.png`          | `ihmsTOUCH.html`              |
| `MMI700.png`            | `ihmsALFA.html`               |
| `R9X307.png`            | `Rádios.html`                 |
| `ParteFinal.jpg`        | `etapaFINAL.html`             |
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
   `Fundamentos.html` para `NovaEtapa.html`) e ajuste: `<title>`, o `<h1>`
   do hero, o texto e os links de conteúdo/prova, e a imagem em
   `Files/` (adicione a nova imagem em `Assets/Files/`).
2. Confirme que o link **"Voltar"** continua apontando para
   `../Acesso ao conteúdo.html`.
3. Na página principal (`Acesso ao conteúdo.html`), dentro da seção
   **"Fases da Formação"**, copie um bloco `<!-- ETAPA N --> ... <div class="card">...</div>` inteiro, cole antes do fechamento do
   `.grid-container` das etapas, e ajuste:
   - o `id` do checkbox (`id="etapa16"`, deve ser único),
   - o `for` do `<label>` correspondente,
   - o título `<h3>`,
   - o texto de `.card-content`,
   - o `href` do botão para `Assets/NovaEtapa.html`.
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
Não há um arquivo CSS compartilhado — cada página tem seu próprio bloco
`<style>` no `<head>`, com variáveis de cor bem parecidas
(`--azul-hi: #004A8F`, `--laranja-hi: #F26522`, etc.). Se quiser mudar a
identidade visual (cores, fontes) de forma consistente, será necessário
editar o `<style>` de cada arquivo HTML individualmente, já que não existe
um `styles.css` central.

---

## 6. Problemas conhecidos / pontos de atenção

- **Nenhum CSS/JS compartilhado**: o CSS é duplicado em todos os 17
  arquivos HTML. Isso facilita editar uma página isoladamente, mas
  qualquer mudança visual "global" (ex.: trocar a cor institucional) hoje
  exige editar arquivo por arquivo. Se o projeto crescer bastante, vale
  considerar extrair um `styles.css` comum.
- **Divergência de maiúsculas/minúsculas em nomes de imagem** — funciona
  no Windows (não sensível a caixa), mas quebra se o site for publicado em
  servidor Linux/GitHub Pages (sensível a caixa):
  - `HIscadaPRO.html` referencia `Files/HIscadaPro.png`, mas o arquivo real
    se chama `Files/HIscadaPRO.png`.
  - `SPDSW.html` referencia `Files/SPDSW.png`, mas o arquivo real se chama
    `Files/SPDSW.PNG`.
- **Nomes de arquivo/pasta com acentos e espaços** (`Acesso ao
  conteúdo.html`, `Rádios.html`, `Programa de Formação/`): funcionam bem
  em ambiente Windows/OneDrive, mas podem exigir URL-encoding ou renomeação
  se o site for hospedado em outro tipo de servidor.
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
  arquivo HTML (não há CSS centralizado).
#   F o r m a - o - H I  
 #   F o r m a - o - H I  
 