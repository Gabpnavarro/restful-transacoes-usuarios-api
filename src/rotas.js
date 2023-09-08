const express = require("express");
const {
  validarEmailExistente,
  validarDados,
  validarTransacao,
  validarIDTransacao,
} = require("./intermediarios/validacoes");
const verificaLogin = require("./intermediarios/verificaLogin");
const {
  cadastrarUsuario,
  login,
  detalharUsuario,
  atualizarUsuario,
} = require("./controladores/usuarios");
const {
  cadastrarTransacao,
  listarTransacao,
  atualizarTransacao,
  deletarTransacao,
  detalharTransacao,
  obterExtrato,
} = require("./controladores/transacao");
const { listarCategoria } = require("./controladores/categoria");


const rotas = express();

rotas.post("/usuario", validarDados, validarEmailExistente, cadastrarUsuario);
rotas.post("/login", login);

rotas.get("/categoria", listarCategoria);

rotas.use(verificaLogin);

rotas.get("/usuario", detalharUsuario);
rotas.put("/usuario", validarDados, validarEmailExistente, atualizarUsuario);

rotas.post("/transacao", validarTransacao, cadastrarTransacao);
rotas.get("/transacao", listarTransacao);
rotas.get("/transacao/extrato", obterExtrato);
rotas.get("/transacao/:id", validarIDTransacao, detalharTransacao);
rotas.put(
  "/transacao/:id",
  validarTransacao,
  validarIDTransacao,
  atualizarTransacao
);
rotas.delete("/transacao/:id", validarIDTransacao, deletarTransacao);

module.exports = rotas;
