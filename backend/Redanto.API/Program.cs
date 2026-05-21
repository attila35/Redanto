using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Redanto.API.Data;
using Redanto.API.Middleware;
using Redanto.API.Options;
using Redanto.API.Repositories;
using Redanto.API.Services;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------------------------------
// Configuration binding
// -----------------------------------------------------------------
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<GutendexOptions>(builder.Configuration.GetSection(GutendexOptions.SectionName));
builder.Services.Configure<UploadOptions>(builder.Configuration.GetSection(UploadOptions.SectionName));

// -----------------------------------------------------------------
// Database — PostgreSQL via EF Core
// -----------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// -----------------------------------------------------------------
// Redis — distributed cache (used by GutendexService)
// -----------------------------------------------------------------
builder.Services.AddStackExchangeRedisCache(opts =>
{
    opts.Configuration = builder.Configuration.GetConnectionString("Redis");
    opts.InstanceName = "redanto:";
});

// -----------------------------------------------------------------
// Authentication — JWT Bearer
// -----------------------------------------------------------------
var jwtOpts = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOpts.Issuer,
            ValidAudience = jwtOpts.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOpts.SecretKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

// -----------------------------------------------------------------
// HttpClient for Gutendex
// -----------------------------------------------------------------
builder.Services.AddHttpClient<IGutendexService, GutendexService>();
// AllowAutoRedirect=false so we can manually follow the HTTPS→HTTP
// redirect that Gutenberg issues (SocketsHttpHandler blocks protocol downgrades automatically).
builder.Services.AddHttpClient("GutenbergContent", c =>
{
    c.DefaultRequestHeaders.Add("User-Agent", "Redanto/1.0 (+https://redanto.app)");
    c.Timeout = TimeSpan.FromSeconds(30);
}).ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    AllowAutoRedirect = false,
    UseCookies = false,
    PooledConnectionLifetime = TimeSpan.FromMinutes(5),
});

// -----------------------------------------------------------------
// Repositories (DI)
// -----------------------------------------------------------------
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISavedBookRepository, SavedBookRepository>();
builder.Services.AddScoped<IUploadedBookRepository, UploadedBookRepository>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();

// -----------------------------------------------------------------
// Services (DI)
// -----------------------------------------------------------------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISavedBookService, SavedBookService>();
builder.Services.AddScoped<IUploadService, UploadService>();
builder.Services.AddScoped<IAuthorService, AuthorService>();

// -----------------------------------------------------------------
// CORS — allow the Angular dev server
// -----------------------------------------------------------------
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:4200" };
builder.Services.AddCors(opts =>
{
    opts.AddDefaultPolicy(p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// -----------------------------------------------------------------
// MVC + Swagger
// -----------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Redanto API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT token (without 'Bearer ' prefix)."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// -----------------------------------------------------------------
// Pipeline
// -----------------------------------------------------------------
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply pending EF Core migrations on startup (convenient for dev)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
