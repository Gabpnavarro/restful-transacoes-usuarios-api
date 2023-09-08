const bcrypt = require("bcrypt");
const pool = require("../conexao");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../senhaJwt");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaCripto = await bcrypt.hash(senha, 10);

    const query = `
     insert into usuarios
     (nome, email, senha)
     values
     ($1, $2, $3) returning *`;

    const { rows } = await pool.query(query, [nome, email, senhaCripto]);
    const { senha: _, ...usuario } = rows[0];

    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { rows, rowCount } = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (rowCount === 0) {
      return res
        .status(401)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const { senha: senhaUsuario, ...usuario } = rows[0];

    const senhaValida = await bcrypt.compare(senha, senhaUsuario);

    if (!senhaValida) {
      return res
        .status(401)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const token = jwt.sign({ id: usuario.id }, senhaJwt);

    return res.json({
      usuario,
      token,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalharUsuario = (req, res) => {
    return res.status(200).json(req.usuario);
};

const atualizarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const id = req.usuario.id;

    const { rows } = await pool.query("select * from usuarios where id = $1", [
      id,
    ]);

    const { senha: senhaUsuario } = rows[0];

    const senhaValida = await bcrypt.compare(senha, senhaUsuario);

    if (!senhaValida) {
      return res
        .status(401)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const senhaCripto = await bcrypt.hash(senha, 10);

    await pool.query(
      "update usuarios set nome = $1, email = $2, senha = $3 where id = $4",
      [nome, email, senhaCripto, id]
    );

    return res.status(200).json();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: "Erro interno no servidor do atualizar usuario" });
  }
};

module.exports = {
  cadastrarUsuario,
  login,
  detalharUsuario,
  atualizarUsuario,
};
