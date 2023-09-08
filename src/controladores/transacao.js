const pool = require("../conexao");
const { descricaoCategoria } = require("../uteis/descricaoCategoria");

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  try {
    const id = req.usuario.id;

    const queryTransacao = `
      insert into transacoes
      (tipo, descricao, valor, data, usuario_id, categoria_id )
      values
      ($1, $2, $3, $4, $5, $6) returning *`;

    const transacaoCadastrada = await pool.query(queryTransacao, [
      tipo,
      descricao,
      valor,
      data,
      id,
      categoria_id,
    ]);

    const categoria_nome = await descricaoCategoria(req, res);

    transacaoCadastrada.rows[0].categoria_nome = categoria_nome;

    return res.status(201).json(transacaoCadastrada.rows[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

const listarTransacao = async (req, res) => {
  try {
    const id = req.usuario.id;

    const query = "select * from transacoes where usuario_id = $1";

    const todasTransacoes = await pool.query(query, [id]);

    for (let i = 0; todasTransacoes.rows.length > i; i++) {
      const transacao = todasTransacoes.rows[i];

      const categoria_nome = await descricaoCategoria(req, res, transacao);

      transacao.categoria_nome = categoria_nome;
    }

    const categoria = req.query;

    const filtrar = Object.keys(categoria).length !== 0;

    if (filtrar) {
      const transacaoFiltrada = [];

      for (let i = 0; categoria.filtro.length > i; i++) {
        const transacoesFiltradas = todasTransacoes.rows.filter(
          (transacao) =>
            transacao.categoria_nome.toLowerCase() ==
            categoria.filtro[i].toLowerCase()
        );

        transacaoFiltrada.push(...transacoesFiltradas);
      }

      return res.status(200).json(transacaoFiltrada);
    } else {
      return res.status(200).json(todasTransacoes.rows);
    }
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

const detalharTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "select * from transacoes where id = $1";

    const todasTransacoes = await pool.query(query, [id]);

    for (let i = 0; todasTransacoes.rows.length > i; i++) {
      const transacao = todasTransacoes.rows[i];

      const categoria_nome = await descricaoCategoria(req, res, transacao);

      transacao.categoria_nome = categoria_nome;
    }

    return res.status(200).json(todasTransacoes.rows[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

const atualizarTransacao = async (req, res) => {
  try {
    const { id } = req.params;

    const { descricao, valor, data, categoria_id, tipo } = req.body;

    const queryUsuario = `update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5
    where id = $6`;

    await pool.query(queryUsuario, [
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      id,
    ]);

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const deletarTransacao = async (req, res) => {
  try {
    const { id } = req.params;

    const queryTransacao = "delete from transacoes where id = $1";

    await pool.query(queryTransacao, [id]);

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const obterExtrato = async (req, res) => {
  try {
    const id = req.usuario.id;

    const queryEntrada =
      "select sum(valor) as total_entrada from transacoes where usuario_id = $1 AND tipo = $2";
    const entradaResultado = await pool.query(queryEntrada, [id, "entrada"]);

    const querySaida =
      "select sum(valor) as total_saida from transacoes where usuario_id = $1 AND tipo = $2";
    const saidaResultado = await pool.query(querySaida, [id, "saida"]);

    const totalEntrada = parseInt(entradaResultado.rows[0].total_entrada) || 0;
    const totalSaida = parseInt(saidaResultado.rows[0].total_saida) || 0;

    return res.status(200).json({ entrada: totalEntrada, saida: totalSaida });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarTransacao,
  listarTransacao,
  atualizarTransacao,
  deletarTransacao,
  detalharTransacao,
  obterExtrato,
};
