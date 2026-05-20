using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;
using UserApp.Infrastructure.Data;

namespace UserApp.Infrastructure.Repositories;

public class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenAsync(string token) =>
        db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token);

    public Task AddAsync(RefreshToken token) { db.RefreshTokens.Add(token); return Task.CompletedTask; }

    public Task UpdateAsync(RefreshToken token) { db.RefreshTokens.Update(token); return Task.CompletedTask; }

    public async Task RevokeAllForUserAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));
    }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
