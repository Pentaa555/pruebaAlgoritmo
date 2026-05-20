using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;
using UserApp.Infrastructure.Data;

namespace UserApp.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByEmailAsync(string email) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(
        string? search, string? role, bool? isActive, int page, int size)
    {
        var query = db.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var escaped = search.Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");
            query = query.Where(u => EF.Functions.Like(u.Name, $"%{escaped}%")
                                  || EF.Functions.Like(u.Email, $"%{escaped}%"));
        }

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return (items, total);
    }

    public Task AddAsync(User user) { db.Users.Add(user); return Task.CompletedTask; }

    public Task UpdateAsync(User user) { db.Users.Update(user); return Task.CompletedTask; }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
