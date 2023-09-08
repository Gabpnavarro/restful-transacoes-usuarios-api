const pool = require('../conexao')

const listarCategoria = async (req, res) => {
  try {
    const { rows } = await pool.query("select * from categorias");

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = { listarCategoria };
