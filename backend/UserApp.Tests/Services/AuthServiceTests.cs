using Moq;
using UserApp.Application.DTOs.Auth;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;
using UserApp.Application.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace UserApp.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IRefreshTokenRepository> _tokenRepo = new();
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IPasswordService> _passwordService = new();
    private readonly IConfiguration _config;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:RefreshExpiryDays"] = "7" })
            .Build();

        _tokenService.Setup(t => t.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>())).Returns("access-token");
        _tokenService.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token");
        _tokenRepo.Setup(r => r.AddAsync(It.IsAny<RefreshToken>())).Returns(Task.CompletedTask);
        _tokenRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        _sut = new AuthService(_userRepo.Object, _tokenRepo.Object, _tokenService.Object, _passwordService.Object, _config);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com"))
                 .ReturnsAsync(new User { Email = "test@test.com" });

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.RegisterAsync(new RegisterDto { Name = "Test", Email = "test@test.com", Password = "pass1234" }));
    }

    [Fact]
    public async Task RegisterAsync_NewUser_ReturnsAccessAndRefreshTokens()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _passwordService.Setup(p => p.Hash("pass1234")).Returns("hashed");
        _userRepo.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _sut.RegisterAsync(new RegisterDto { Name = "Test", Email = "test@test.com", Password = "pass1234" });

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("bad@test.com")).ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _sut.LoginAsync(new LoginDto { Email = "bad@test.com", Password = "pass" }));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedException()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Role = "user", IsActive = true, PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com")).ReturnsAsync(user);
        _passwordService.Setup(p => p.Verify("wrong", "hashed")).Returns(false);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _sut.LoginAsync(new LoginDto { Email = "test@test.com", Password = "wrong" }));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokens()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Role = "user", IsActive = true, PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com")).ReturnsAsync(user);
        _passwordService.Setup(p => p.Verify("pass1234", "hashed")).Returns(true);

        var result = await _sut.LoginAsync(new LoginDto { Email = "test@test.com", Password = "pass1234" });

        Assert.Equal("access-token", result.AccessToken);
    }

    [Fact]
    public async Task RefreshAsync_RevokedToken_ThrowsUnauthorizedException()
    {
        var token = new RefreshToken { Token = "old", RevokedAt = DateTime.UtcNow };
        _tokenRepo.Setup(r => r.GetByTokenAsync("old")).ReturnsAsync(token);

        await Assert.ThrowsAsync<UnauthorizedException>(() => _sut.RefreshAsync("old"));
    }
}
