require("dotenv").config();
const path = require("path");
const express = require("express");
const router = require("./routers/router");
const memoryRouter = require("./routers/memoryRouter");
const app = express();

const port = Number(process.env.PORT || process.env.DB_PORT) || 3000;
const useMemoryDb = !process.env.DB_HOST || process.env.USE_MEMORY_DB === "true";

// CORS simples para permitir que o frontend consuma a API pelo navegador
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }
  return next(err);
});

app.use(useMemoryDb ? memoryRouter : router);
app.use(express.static(path.join(__dirname, "frontend")));

app.listen(port, () => {
  console.log(`API em http://localhost:${port}`);
  console.log(`Front em http://localhost:${port}/app.html`);
  if (useMemoryDb) {
    console.log(
      "Modo memória: não há .env/MySQL configurado. Os dados valem só enquanto o servidor estiver ligado."
    );
  }
});

