// index.js – Rede de postos de carregamento
import express, { json } from "express";
import { connect as _connect } from "mongoose";
import postosRoutes from "./Controllers/postos.js"; // Pode precisar da extensão .js
import autenticar from "./Middlewares/auth.js"; // Pode precisar da extensão .js

// 1. PRIMEIRO: Inicializar o express
const app = express();
const PORT = process.env.PORT || 4000;

app.use(json());

// 2. SEGUNDO: Declarar as rotas de teste (agora o 'app' já existe)
// Rota pública (qualquer um acede)
app.get('/api/publica', (req, res) => {
    res.send("Página pública");
});

// Rota privada (requer o username e password no header)
app.get('/api/privada', autenticar, (req, res) => {
    res.send("Bem-vindo à área reservada!");
});

// 3. TERCEIRO: Ligação através do Mongoose
// Substitui <username> e <password> pelas tuas credenciais reais do MongoDB Atlas
const url = process.env.MONGO_URL || "mongodb+srv://sebastiaoooliveirasilva_db_user:basti100302@rruxaw9.mongodb.net";
const dbName = "rede_carregamento";
const connect = _connect(url, { dbName });

connect
  .then(() => {
    console.log("Ligacao ao servidor estabelecida");

    // A. Middleware: corre em TODOS os pedidos, antes das rotas
    app.use((req, res, next) => {
      const agora = new Date().toLocaleString("pt-PT");
      console.log(`[${agora}] ${req.method} ${req.originalUrl}`);
      next();
    });

    // B. Prefixo /postos para todos os endpoints do router
    // O middleware 'autenticar' vai proteger todas as rotas dos postos
    app.use("/postos", autenticar, postosRoutes);

    // Rota inexistente -> 404 em JSON
    app.use((req, res) => {
      res.status(404).json({ erro: "Rota não encontrada" });
    });

    // JSON mal formado no body, etc. -> 400
    app.use((error, req, res, next) => {
      if (res.headersSent) return next(error);
      res.status(400).json({ erro: "Pedido inválido" });
    });

    // O listen é sempre a última linha de configuração
    app.listen(PORT, () => {
      console.log(`Rede de carregamento na porta ${PORT}`);
    });
  })
  .catch((error) => console.error("Erro ao ligar ao MongoDB:", error));