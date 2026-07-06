using System.Text.Json.Serialization;

namespace ControleGastosApi.Models
{
    public class Pessoa
    {
        public int Id { get; set; } // Gerado automaticamente
        public string Nome { get; set; } = string.Empty;
        public int Idade { get; set; }

        // Relacionamento 1 para Muitos (Uma pessoa, várias transações)
        // JsonIgnore evita loops infinitos na resposta da API
        [JsonIgnore] 
        public List<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}