# CompassCar - Frontend & Landing Page

Este diretório contém os dois artefatos de front exigidos na 2ª entrega:

- **Landing page** (`index.html`): página de apresentação do projeto, publicável no GitHub Pages.
- **Frontend / sistema** (`app.html`): interface que consome a API do CompassCar (listar, filtrar, cadastrar, ver detalhes e excluir veículos).

## Estrutura

```
frontend/
├── index.html      # Landing page
├── app.html        # Sistema (consome a API)
├── css/styles.css  # Estilos
└── js/app.js       # Lógica que consome a API
```

## Como rodar localmente

1. Suba a API (na raiz do projeto):
   ```bash
   npm install
   npm run dev
   ```
   A API sobe na porta definida em `DB_PORT` no `.env` (ex.: `3000`).

2. Abra o front. O jeito mais simples é servir a pasta com qualquer servidor estático, por exemplo:
   ```bash
   npx serve frontend
   ```
   Ou apenas abra `frontend/index.html` no navegador.

3. Em `app.html`, informe a **URL base da API** (ex.: `http://localhost:3000`) e clique em Salvar. O valor fica guardado no navegador.

> A API já libera CORS (`Access-Control-Allow-Origin: *`), então o navegador consegue chamá-la de outra origem.

## Publicar a landing page no GitHub Pages

1. No repositório do GitHub, vá em **Settings → Pages**.
2. Em **Build and deployment**, selecione a branch (ex.: `main`) e a pasta.
   - Se apontar para a raiz, acesse a landing em `.../frontend/index.html`.
   - Alternativa: copiar os arquivos da pasta `frontend` para uma branch `gh-pages` na raiz.
3. Salve e aguarde a publicação; o link aparece na própria tela do GitHub Pages.
