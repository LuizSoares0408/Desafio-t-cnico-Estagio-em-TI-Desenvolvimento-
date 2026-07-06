namespace ControleGastosApi.Models
{
    public enum TipoTransacao
    {
        Receita, // 0
        Despesa  // 1
    }

    public class Transacao
    {
        public int Id { get; set; } // Gerado automaticamente
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public TipoTransacao Tipo { get; set; }

        // Chave Estrangeira vinculando à Pessoa
        public int PessoaId { get; set; }
        public Pessoa? Pessoa { get; set; }
    }
}