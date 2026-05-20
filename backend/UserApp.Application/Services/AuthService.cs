using Microsoft.Extensions.Configuration;
using UserApp.Application.DTOs.Auth;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;

namespace UserApp.Application.Services;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository tokens,
    ITokenService tokenService,
    IPasswordService passwordService,
    IConfiguration config) : IAuthService
{
    public async Task<LoginResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (existing != null)
            throw new ConflictException("Email already in use.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = passwordService.Hash(dto.Password),
            Role = "user",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await users.AddAsync(user);
        await users.SaveChangesAsync();
        return await IssueTokensAsync(user);
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (user == null || !user.IsActive || !passwordService.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        return await IssueTokensAsync(user);
    }

    public async Task<LoginResponseDto> RefreshAsync(string refreshToken)
    {
        var token = await tokens.GetByTokenAsync(refreshToken);
        if (token == null || token.RevokedAt != null || token.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Invalid or expired refresh token.");

        var user = await users.GetByIdAsync(token.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedException("User not found or inactive.");

        token.RevokedAt = DateTime.UtcNow;
        await tokens.UpdateAsync(token);
        await tokens.SaveChangesAsync();

        return await IssueTokensAsync(user);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var token = await tokens.GetByTokenAsync(refreshToken);
        if (token == null) return;
        token.RevokedAt = DateTime.UtcNow;
        await tokens.UpdateAsync(token);
        await tokens.SaveChangesAsync();
    }

    private async Task<LoginResponseDto> IssueTokensAsync(User user)
    {
        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Role);
        var refreshTokenStr = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "7");

        await tokens.AddAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        });
        await tokens.SaveChangesAsync();

        return new LoginResponseDto(
            accessToken,
            refreshTokenStr,
            new UserResponseDto(user.Id, user.Name, user.Email, user.Role));
    }
}
