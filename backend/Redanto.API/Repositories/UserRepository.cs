using Microsoft.EntityFrameworkCore;
using Redanto.API.Data;
using Redanto.API.Models;

namespace Redanto.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Username == username, ct);

    public Task<User?> GetByIdentifierAsync(string identifier, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(
            u => u.Email == identifier || u.Username == identifier, ct);

    public Task<bool> ExistsByEmailOrUsernameAsync(string email, string username, CancellationToken ct = default) =>
        _db.Users.AnyAsync(u => u.Email == email || u.Username == username, ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await _db.Users.AddAsync(user, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}
