using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;
using UserApp.Infrastructure.Data;

namespace UserApp.Infrastructure.Repositories;

public class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenAsync(string token) =>
        db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token);

    public async Task AddAsync(RefreshToken token) => await db.RefreshTokens.AddAsync(token);

    public Task UpdateAsync(RefreshToken token) { db.RefreshTokens.Update(token); return Task.CompletedTask; }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
