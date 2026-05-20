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

    public async Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(string? search, int page, int size)
    {
        var query = db.Users.Where(u => u.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .AsNoTracking()
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
