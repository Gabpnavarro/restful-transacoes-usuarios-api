const pool = require("../conexao");

const validarEmailExistente = async (req, res, next) => {
  try {
    const { email } = req.body;

    const validarEmail = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (validarEmail.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }

  next();
};

const validarDados = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Por favor preencha os campos obrigatórios" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
  next();
};

const validarTransacao = async (req, res, next) => {
  try {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res
        .status(400)
        .json({
          mensagem: "Todos os campos obrigatórios devem ser informados.",
        });
    }

    if (tipo != "entrada" && tipo != "saida") {
      return res
        .status(400)
        .json({ mensagem: "Digite o tipo corretamente: entrada ou saida." });
    }

    const { rowCount } = await pool.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );

    if (rowCount === 0) {
      return res.status(400).json({ mensagem: "Categoria não encontrada" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
  next();
};

const validarIDTransacao = async (req, res, next) => {
  try {
    const idToken = req.usuario.id;

    const { id } = req.params;

    const queryUsuario = "select * from transacoes where id = $1";

    const transacoes = await pool.query(queryUsuario, [id]);

    if (transacoes.rowCount === 0) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    if (transacoes.rows[0].usuario_id !== idToken) {
      return res.status(400).json({ mensagem: "Não autorizado." });
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
  next();
};
module.exports = {
  validarEmailExistente,
  validarDados,
  validarTransacao,
  validarIDTransacao,
};
