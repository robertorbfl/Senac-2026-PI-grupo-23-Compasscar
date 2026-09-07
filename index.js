require("dotenv").config();
const express = require("express");
const router = require("./routers/router");
const app = express();

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
app.use(router);

app.listen(process.env.DB_PORT);

