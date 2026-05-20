using UserApp.Application.DTOs.Common;
using UserApp.Application.DTOs.Users;
namespace UserApp.Application.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllAsync(string? search, int page, int size);
    Task<UserDto> GetByIdAsync(Guid id, Guid requesterId, string requesterRole);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid requesterId, string requesterRole);
    Task DeleteAsync(Guid id);
}
