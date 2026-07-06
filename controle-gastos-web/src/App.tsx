import { useState, useEffect } from 'react';
import axios from 'axios';
import api from './services/api';

// Definição das interfaces TypeScript para tipagem segura dos dados
interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

interface TotalPessoaDto {
  pessoaId: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface RelatorioTotaisDto {
  detalhePorPessoa: TotalPessoaDto[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}

export default function App() {
  // Estados para gerenciamento de dados do Banco
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioTotaisDto | null>(null);

  // Estados dos formulários de cadastro
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'0' | '1'>('0'); // 0 = Receita, 1 = Despesa
  const [pessoaSelecionadaId, setPessoaSelecionadaId] = useState('');

  // Mensagens de feedback para o usuário
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });

  // 1. CARREGAMENTO INICIAL (Consome /api/pessoas e /api/relatorios via baseURL)
  useEffect(() => {
    let ativo = true;

    async function inicializarDados() {
      try {
        const resPessoas = await api.get<Pessoa[]>('/pessoas');
        const resTotais = await api.get<RelatorioTotaisDto>('/relatorios'); // 🔄 Rota corrigida aqui!
        
        if (ativo) {
          setPessoas(resPessoas.data);
          setRelatorio(resTotais.data);
        }
      } catch (err) {
        console.error("Erro na carga inicial:", err);
      }
    }

    inicializarDados();

    return () => {
      ativo = false;
    };
  }, []);

  // 2. FUNÇÃO AUXILIAR PARA ATUALIZAÇÕES APÓS CADASTROS
  const recarregarDadosDoSistema = async () => {
    try {
      const resPessoas = await api.get<Pessoa[]>('/pessoas');
      const resTotais = await api.get<RelatorioTotaisDto>('/relatorios'); // 🔄 Rota corrigida aqui!
      setPessoas(resPessoas.data);
      setRelatorio(resTotais.data);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    }
  };

  const exibirMensagem = (texto: string, erro = false) => {
    setMensagem({ texto, erro });
    setTimeout(() => setMensagem({ texto: '', erro: false }), 5000);
  };

  // AÇÃO: CADASTRAR PESSOA
  const handleCadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !idade) return exibirMensagem("Preencha todos os campos da pessoa.", true);

    try {
      await api.post('/pessoas', { nome, idade: Number(idade) });
      setNome('');
      setIdade('');
      await recarregarDadosDoSistema();
      exibirMensagem("Pessoa cadastrada com sucesso!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        exibirMensagem(err.response?.data || "Erro ao cadastrar pessoa.", true);
      }
    }
  };

  // AÇÃO: DELETAR PESSOA
  const handleDeletarPessoa = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta pessoa? Todas as suas transações vinculadas serão apagadas.")) return;
    try {
      await api.delete(`/pessoas/${id}`);
      exibirMensagem("Pessoa e suas transações excluídas com sucesso!");
      await recarregarDadosDoSistema();
    } catch {
      exibirMensagem("Erro ao deletar pessoa.", true);
    }
  };

  // AÇÃO: CADASTRAR TRANSAÇÃO (Validação estrita de menor de idade)
  const handleCadastrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !pessoaSelecionadaId) {
      return exibirMensagem("Preencha todos os campos da transação.", true);
    }

    const pSelecionada = pessoas.find(p => p.id === Number(pessoaSelecionadaId));
    
    // Regra de Negócio Crucial: Menor de 18 anos só registra despesa
    if (pSelecionada && pSelecionada.idade < 18 && tipo === '0') {
      return exibirMensagem(`Regra de Negócio: ${pSelecionada.nome} é menor de idade (${pSelecionada.idade} anos) e só pode registrar Despesas!`, true);
    }

    try {
      await api.post('/transacoes', {
        descricao,
        valor: Number(valor),
        tipo: Number(tipo),
        pessoaId: Number(pessoaSelecionadaId)
      });
      exibirMensagem("Transação adicionada com sucesso!");
      setDescricao('');
      setValor('');
      await recarregarDadosDoSistema();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        exibirMensagem(err.response?.data || "Erro ao inserir transação.", true);
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Controle de Gastos Residenciais</h1>

      {mensagem.texto && (
        <div style={{
          padding: '12px', marginBottom: '20px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold',
          backgroundColor: mensagem.erro ? '#f8d7da' : '#d4edda', color: mensagem.erro ? '#721c24' : '#155724'
        }}>
          {mensagem.texto}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Seção Cadastro de Pessoas */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#000000' }}>Cadastro de Pessoas</h2>
          <form onSubmit={handleCadastrarPessoa}>
            <div style={{ marginBottom: '10px' }}>
              <label>Nome: </label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Idade: </label>
              <input type="number" value={idade} onChange={e => setIdade(e.target.value)} style={{ width: '100%', padding: '6px' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer', width: '100%' }}>Cadastrar</button>
          </form>

          <h3 style={{ marginTop: '20px' }}>Lista de Pessoas</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {pessoas.map(p => (
              <li key={p.id} style={{ marginBottom: '8px' }}>
                {p.nome} ({p.idade} anos) 
                <button onClick={() => handleDeletarPessoa(p.id)} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '2px 6px', cursor: 'pointer' }}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Seção Cadastro de Transações */}
        <div style={{ border: '1px solid #0a0a0a', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#000000' }}>Cadastro de Transações</h2>
          <form onSubmit={handleCadastrarTransacao}>
            <div style={{ marginBottom: '10px' }}>
              <label>Pessoa Vinculada: </label>
              <select value={pessoaSelecionadaId} onChange={e => setPessoaSelecionadaId(e.target.value)} style={{ width: '100%', padding: '6px' }}>
                <option value="">Selecione uma pessoa...</option>
                {pessoas.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Descrição: </label>
              <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Valor (R$): </label>
              <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Tipo: </label>
              <select value={tipo} onChange={e => setTipo(e.target.value as '0' | '1')} style={{ width: '100%', padding: '6px' }}>
                <option value="0">Receita</option>
                <option value="1">Despesa</option>
              </select>
            </div>
            <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer', width: '100%' }}>Adicionar Transação</button>
          </form>
        </div>
      </div>

      {/* Seção de Relatório e Totais */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h2 style={{ color: '#000000' }}>Consulta de Totais</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Pessoa</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total Receitas</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total Despesas</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Saldo Individual</th>
            </tr>
          </thead>
          <tbody>
            {relatorio?.detalhePorPessoa.map(detalhe => (
              <tr key={detalhe.pessoaId}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{detalhe.nome}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', color: 'green' }}>R$ {detalhe.totalReceitas.toFixed(2)}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', color: 'red' }}>R$ {detalhe.totalDespesas.toFixed(2)}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: detalhe.saldo >= 0 ? 'blue' : 'darkred' }}>
                  R$ {detalhe.saldo.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {relatorio && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span style={{ color: 'green' }}>Receita Geral: R$ {relatorio.totalGeralReceitas.toFixed(2)}</span>
            <span style={{ color: 'red' }}>Despesa Geral: R$ {relatorio.totalGeralDespesas.toFixed(2)}</span>
            <span style={{ color: relatorio.saldoLiquidoGeral >= 0 ? 'blue' : 'darkred', fontSize: '1.1em' }}>
              Saldo Líquido Geral: R$ {relatorio.saldoLiquidoGeral.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}