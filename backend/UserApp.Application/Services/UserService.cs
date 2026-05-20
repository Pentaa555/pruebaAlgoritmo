using UserApp.Application.DTOs.Common;
using UserApp.Application.DTOs.Users;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;

namespace UserApp.Application.Services;

public class UserService(IUserRepository users, IPasswordService password, IRefreshTokenRepository tokens) : IUserService
{
    public async Task<PagedResult<UserDto>> GetAllAsync(
        string? search, string? role, bool? isActive, int page, int size)
    {
        var (items, total) = await users.GetPagedAsync(search, role, isActive, page, size);
        var dtos = items.Select(ToDto);
        return new PagedResult<UserDto>(dtos, total, page, size);
    }

    public async Task<UserDto> GetByIdAsync(Guid id, Guid requesterId, string requesterRole)
    {
        if (requesterRole != "admin" && requesterId != id)
            throw new ForbiddenException("Access denied.");

        var user = await users.GetByIdAsync(id);
        if (user == null || (requesterRole != "admin" && !user.IsActive))
            throw new NotFoundException("User not found.");

        return ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (existing != null)
            throw new ConflictException("Email already in use.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = password.Hash(dto.Password),
            Role = dto.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await users.AddAsync(user);
        await users.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid requesterId, string requesterRole)
    {
        if (requesterRole != "admin" && requesterId != id)
            throw new ForbiddenException("Access denied.");

        var user = await users.GetByIdAsync(id);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found.");

        user.Name = dto.Name;

        if (requesterRole == "admin")
        {
            if (dto.Email != null) user.Email = dto.Email.ToLowerInvariant();
            if (dto.Role != null) user.Role = dto.Role;
            if (dto.NewPassword != null) user.PasswordHash = password.Hash(dto.NewPassword);
        }
        else if (dto.NewPassword != null)
        {
            if (dto.CurrentPassword == null || !password.Verify(dto.CurrentPassword, user.PasswordHash))
                throw new UnauthorizedException("Incorrect current password.");
            user.PasswordHash = password.Hash(dto.NewPassword);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await users.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await users.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await tokens.RevokeAllForUserAsync(id);
        await users.SaveChangesAsync();
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt);
}
