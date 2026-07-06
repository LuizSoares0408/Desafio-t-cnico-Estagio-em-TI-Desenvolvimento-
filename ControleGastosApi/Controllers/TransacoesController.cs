using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastosApi.Data;
using ControleGastosApi.Models;

namespace ControleGastosApi.Controllers
{
    [ApiController]
    [Route("api/transacoes")] // 🔄 Corrigido para a rota correta de transações
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LISTAR TRANSAÇÕES
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes()
        {
            return await _context.Transacoes.ToListAsync();
        }

        // 2. CADASTRAR TRANSAÇÃO (Com as validações da regra de negócio)
        [HttpPost]
        public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
        {
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("Regra de Negócio: A pessoa informada não existe no cadastro.");
            }

            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
            {
                return BadRequest("Regra de Negócio: Menores de 18 anos não podem cadastrar receitas, apenas despesas.");
            }

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransacoes), new { id = transacao.Id }, transacao);
        }

        // 3. NOVO ENDPOINT: CONSULTA DE TOTAIS (RELATÓRIOS)
        // 🔄 Mapeia especificamente a rota "api/relatorios" que o React precisa
        [HttpGet("/api/relatorios")] 
        public async Task<IActionResult> GetRelatorios()
        {
            var pessoas = await _context.Pessoas.ToListAsync();
            var transacoes = await _context.Transacoes.ToListAsync();

            var detalhePorPessoa = pessoas.Select(p => {
                var transacoesPessoa = transacoes.Where(t => t.PessoaId == p.Id);
                
                // Supondo que TipoTransacao.Receita = 0 e Despesa = 1 no seu Enum
                var totalReceitas = transacoesPessoa.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor);
                var totalDespesas = transacoesPessoa.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor);

                return new
                {
                    pessoaId = p.Id,
                    nome = p.Nome,
                    totalReceitas = totalReceitas,
                    totalDespesas = totalDespesas,
                    saldo = totalReceitas - totalDespesas
                };
            }).ToList();

            var totalGeralReceitas = detalhePorPessoa.Sum(d => d.totalReceitas);
            var totalGeralDespesas = detalhePorPessoa.Sum(d => d.totalDespesas);

            return Ok(new
            {
                detalhePorPessoa,
                totalGeralReceitas,
                totalGeralDespesas,
                saldoLiquidoGeral = totalGeralReceitas - totalGeralDespesas
            });
        }
    }
}