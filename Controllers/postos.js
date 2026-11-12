// Controllers/postos.js
// Controlador do recurso Posto, agora com Router (alínea B) e Mongoose (alínea C).

const express = require("express");
const router = express.Router();
const Posto = require("../Models/posto");

/*
=========== VERSÃO DA FICHA 2 (driver nativo do MongoDB) – comentada ===========
A Ficha 2 usava app.get/app.post/... e a collection do driver, por exemplo:

  app.get("/postos", async (req, res) => {
      res.json(await postos().find(filtro, SEM_ID).toArray());
  });
  app.get("/postos/:id", async (req, res) => {
      const posto = await postos().findOne({ id: req.params.id }, SEM_ID);
      ...
  });
  ... (insertOne, replaceOne, findOneAndUpdate, findOneAndDelete)

Agora usa-se router.* e o modelo Posto (Mongoose).
==============================================================================
*/

// Converte os erros do Mongoose numa resposta HTTP com o status correto.
function tratarErro(err, res) {
  // Falhou uma validação do Schema (required, minlength, max, validator, enum...)
  if (err.name === "ValidationError") {
    const campos = {};
    for (const [campo, e] of Object.entries(err.errors)) {
      campos[campo] = e.message; // mensagens personalizadas do Schema
    }
    return res.status(400).json({ erro: "Campos inválidos", campos });
  }
  // Índice unique violado (id repetido)
  if (err.code === 11000) {
    return res.status(409).json({ erro: "id já existe" });
  }
  // Valor com tipo impossível de converter
  if (err.name === "CastError") {
    return res.status(400).json({ erro: `Valor inválido para o campo ${err.path}` });
  }
  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}

// [GET] Listar postos, com filtros opcionais
//   /postos?disponivel=true   /postos?tipo=DC   /postos?categoria=publico
router.get("/", async (req, res) => {
  try {
    const filtro = {};
    if (typeof req.query.tipo === "string") filtro.tipo = req.query.tipo;
    if (typeof req.query.categoria === "string") filtro.categoria = req.query.categoria;

    if (req.query.disponivel !== undefined) {
      if (req.query.disponivel !== "true" && req.query.disponivel !== "false") {
        return res.status(400).json({ erro: "disponivel deve ser true ou false" });
      }
      filtro.disponivel = req.query.disponivel === "true";
    }

    const postos = await Posto.find(filtro);
    return res.status(200).json(postos); // lista vazia também é 200
  } catch (err) {
    return tratarErro(err, res);
  }
});

// [GET] Um posto pelo id  (ex.: /postos/PC-101)
router.get("/:id", async (req, res) => {
  try {
    const posto = await Posto.findOne({ id: req.params.id });
    if (!posto) return res.status(404).json({ erro: "Posto não encontrado" });
    return res.status(200).json(posto);
  } catch (err) {
    return tratarErro(err, res);
  }
});

// [POST] Criar um posto
router.post("/", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ erro: "Body em falta" });
    }
    const { id, local, potenciaKw, disponivel, categoria, tipo } = req.body;
    const posto = await Posto.create({ id, local, potenciaKw, disponivel, categoria, tipo });
    return res.status(201).json(posto);
  } catch (err) {
    return tratarErro(err, res);
  }
});

// [PUT] Substituir o posto inteiro (o id vem sempre do URL)
router.put("/:id", async (req, res) => {
  try {
    const posto = await Posto.findOne({ id: req.params.id });
    if (!posto) return res.status(404).json({ erro: "Posto não encontrado" });

    const { id, local, potenciaKw, disponivel, categoria, tipo } = req.body || {};
    posto.overwrite({ id: req.params.id, local, potenciaKw, disponivel, categoria, tipo });
    await posto.save(); // o save() corre as validações do Schema
    return res.status(200).json(posto);
  } catch (err) {
    return tratarErro(err, res);
  }
});

// [PATCH] Alteração parcial (só os campos enviados; o id nunca muda)
router.patch("/:id", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ erro: "Body em falta" });
    }
    const { id, _id, __v, createdAt, updatedAt, ...alteracoes } = req.body;
    if (Object.keys(alteracoes).length === 0) {
      return res.status(400).json({ erro: "Nada para alterar" });
    }

    const posto = await Posto.findOneAndUpdate(
      { id: req.params.id },
      { $set: alteracoes },
      { returnDocument: "after", runValidators: true } // runValidators: valida também nos updates
    );
    if (!posto) return res.status(404).json({ erro: "Posto não encontrado" });
    return res.status(200).json(posto);
  } catch (err) {
    return tratarErro(err, res);
  }
});

// [DELETE] Apagar um posto
router.delete("/:id", async (req, res) => {
  try {
    const removido = await Posto.findOneAndDelete({ id: req.params.id });
    if (!removido) return res.status(404).json({ erro: "Posto não encontrado" });
    return res.status(200).json(removido);
  } catch (err) {
    return tratarErro(err, res);
  }
});

module.exports = router;
