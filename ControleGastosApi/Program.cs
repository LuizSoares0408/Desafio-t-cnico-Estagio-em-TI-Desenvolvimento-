using Microsoft.EntityFrameworkCore;
using ControleGastosApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. SUPORTE PARA CONTROLLERS (Corrige o erro que deu no terminal)
builder.Services.AddControllers();

// 2. CONFIGURAÇÃO DO BANCO SQ-LITE
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=controleGastos.db"));

// 3. CONFIGURAÇÃO DO CORS (Para o React conseguir consumir a API depois)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. CONFIGURAÇÃO DO SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. ATIVAÇÃO DO SWAGGER EM AMBIENTE DE DESENVOLVIMENTO
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Controle de Gastos API v1");
    });
}

// Ativa a política de acesso livre que configuramos acima
app.UseCors("PermitirTudo");

app.UseAuthorization();

app.MapControllers();

app.Run();