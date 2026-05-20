using UserApp.Application.Entities;
namespace UserApp.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(string? search, int page, int size);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task SaveChangesAsync();
}
