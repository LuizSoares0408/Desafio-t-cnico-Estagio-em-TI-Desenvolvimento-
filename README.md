# Controle de Gastos Residenciais
A aplicação consiste em um sistema completo (Full Stack) para gerenciar movimentações financeiras familiares, controlando receitas e despesas por pessoa com regras de negócio integradas.

## 🚀 Tecnologias Utilizadas

### Back-end
- **C# / .NET 10** (ASP.NET Core Web API)
- **Entity Framework Core**
- **SQLite** (Banco de dados local)
- **Swagger UI** (Documentação e testes de endpoints)

### Front-end
- **React** (com TypeScript)
- **Vite** (Build tool rápida)
- **Axios** (Integração e consumo da API)
- **CSS Estilizado** (Interface moderna e responsiva)

---

## ⚙️ Regras de Negócio Implementadas

1. **Validação de Cadastro:** Não é possível associar transações a usuários que não estejam previamente cadastrados no sistema.
2. **Restrição por Idade:** Menores de 18 anos são bloqueados pelo backend caso tentem registrar uma **Receita**. Eles estão autorizados a registrar apenas **Despesas**.
3. **Cálculo Consolidado:** O sistema processa no servidor e retorna os totais de receitas, despesas e saldos individuais por pessoa, além do saldo líquido geral do domicílio.

---

## 📦 Como Executar a Aplicação Localmente

Certifique-se de ter o [.NET SDK](https://dotnet.microsoft.com/download) e o [Node.js](https://nodejs.org/) instalados em sua máquina.

### 1. Executando o Back-end (.NET)
Abra o terminal na pasta raiz do projeto e execute os seguintes comandos:
```bash
# Navegar até a pasta do servidor
cd ControleGastosApi

# Restaurar dependências e rodar a API
dotnet run
