using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;

namespace UserApp.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordService passwordService)
    {
        if (await db.Users.AnyAsync()) return;

        db.Users.AddRange(
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Email = "admin@demo.com",
                PasswordHash = passwordService.Hash("Admin123!"),
                Role = "admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Demo User",
                Email = "user@demo.com",
                PasswordHash = passwordService.Hash("User123!"),
                Role = "user",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        await db.SaveChangesAsync();
    }
}
