const pool = require("../conexao");

const descricaoCategoria = async (req, res, transacao) => {
  try {
    const queryCategoriaNome = "select descricao from categorias where id = $1";

    if (!transacao) {
      const { categoria_id } = req.body;

      const { rows } = await pool.query(queryCategoriaNome, [categoria_id]);

      return rows[0].descricao;
    } else {
      const { rows } = await pool.query(queryCategoriaNome, [transacao.categoria_id]);

      return rows[0].descricao;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor aqui" });
  }
};

module.exports = { descricaoCategoria };
