# CompassCar

API e frontend para gerenciamento de veículos disponíveis para locação.

## Funcionalidades atuais

- Cadastro de veículos com marca, modelo, ano e itens.
- Listagem paginada com filtros por marca, modelo e ano mínimo.
- Consulta de detalhes por ID, incluindo os itens do veículo.
- Edição parcial e exclusão de veículos.
- Validação de campos obrigatórios, intervalo de ano e duplicidade.
- Frontend com cadastro, edição, filtros, paginação, detalhes e exclusão.
- Landing page em `frontend/index.html`.
- Modo memória para execução sem MySQL, com dados mantidos apenas enquanto o servidor estiver ligado.

## Tecnologias

- Node.js e Express
- MySQL com `mysql2`
- HTML, CSS e JavaScript no frontend

## Pré-requisitos

- Node.js instalado
- MySQL configurado para usar a persistência no banco

## Instalação e execução

```bash
npm install
npm run dev
```

O servidor inicia na porta definida por `PORT` ou `DB_PORT`; se nenhuma for informada, usa a porta `3000`.

Quando `DB_HOST` não está configurado, a aplicação usa automaticamente o modo memória. Para usar MySQL, configure no `.env`:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=compasscar
PORT=3000
```

Crie as tabelas executando [`db/dump.sql`](db/dump.sql) no MySQL.

Com o servidor em execução:

- API: `http://localhost:3000`
- Sistema: `http://localhost:3000/app.html`
- Landing page: `http://localhost:3000/index.html`

O frontend também pode ser servido separadamente. Nesse caso, informe em `app.html` a URL base da API; o valor é salvo no navegador. A API possui CORS habilitado para permitir esse uso.

## Endpoints

### Cadastrar veículo

`POST /api/v1/cars`

```json
{
  "brand": "Volkswagen",
  "model": "GOL G5",
  "year": 2021,
  "items": ["Ar-condicionado", "Direção hidráulica"]
}
```

### Listar veículos

`GET /api/v1/cars`

Parâmetros opcionais:

- `page`: página atual, padrão `1`.
- `limit`: registros por página, padrão `5`, entre `1` e `10`.
- `brand`: filtro parcial da marca.
- `model`: filtro parcial do modelo.
- `year`: ano mínimo.

Exemplo: `/api/v1/cars?page=1&limit=2&brand=vol&model=gol&year=2015`

### Consultar veículo

`GET /api/v1/cars/:id`

Retorna os dados do veículo e seus itens.

### Atualizar veículo

`PATCH /api/v1/cars/:id`

Todos os campos são opcionais. O corpo pode conter `brand`, `model`, `year` e `items`.

### Excluir veículo

`DELETE /api/v1/cars/:id`

Remove o veículo pelo ID.

## Banco de dados

O banco `compasscar` possui as tabelas:

- `cars`: `id`, `brand`, `model` e `year`.
- `cars_items`: `id`, `name` e `car_id`, relacionado a `cars.id`.

## Frontend

Os arquivos da interface estão em `frontend/`:

- `index.html`: landing page.
- `app.html`: sistema de gerenciamento.
- `css/styles.css`: estilos.
- `js/app.js`: integração com a API.

## Convenções de commit

Use commits pequenos em inglês seguindo Conventional Commits, por exemplo:

- `feat: add car creation endpoint`
- `fix: correct validation for car year`

## Contribuidores

- [Wagner_Suzano](https://github.com/WagnerSuzano2)
- [Iago Viana Carvalho](https://github.com/oiagoviana)
- [Roberto da Rosa Borges Fonseca Lima](https://github.com/robertorbfl)
- Igor de Castro Brambila
- Romulo Fraga de Oliveira
- [Joao Ricardo Vano Ferreira](https://github.com/jorikardx)
