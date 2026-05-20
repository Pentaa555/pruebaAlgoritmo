using Moq;
using UserApp.Application.DTOs.Users;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;
using UserApp.Application.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordService> _password = new();
    private readonly Mock<IRefreshTokenRepository> _tokens = new();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _tokens.Setup(r => r.RevokeAllForUserAsync(It.IsAny<Guid>())).Returns(Task.CompletedTask);
        _sut = new UserService(_userRepo.Object, _password.Object, _tokens.Object);
    }

    [Fact]
    public async Task GetByIdAsync_UserRole_OtherUserId_ThrowsForbiddenException()
    {
        var requesterId = Guid.NewGuid();
        var targetId = Guid.NewGuid();

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            _sut.GetByIdAsync(targetId, requesterId, "user"));
    }

    [Fact]
    public async Task GetByIdAsync_UserNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _userRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            _sut.GetByIdAsync(id, id, "user"));
    }

    [Fact]
    public async Task GetByIdAsync_AdminRole_AnyId_ReturnsUser()
    {
        var user = new User { Id = Guid.NewGuid(), Name = "Test", Email = "t@t.com", Role = "user", IsActive = true, CreatedAt = DateTime.UtcNow };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _sut.GetByIdAsync(user.Id, Guid.NewGuid(), "admin");

        Assert.Equal(user.Id, result.Id);
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("dup@test.com"))
                 .ReturnsAsync(new User { Email = "dup@test.com" });

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.CreateAsync(new CreateUserDto { Name = "X", Email = "dup@test.com", Password = "pass1234", Role = "user" }));
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmailMixedCase_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("dup@test.com"))
                 .ReturnsAsync(new User { Email = "dup@test.com" });

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.CreateAsync(new CreateUserDto { Name = "X", Email = "DUP@TEST.COM", Password = "pass1234", Role = "user" }));
    }

    [Fact]
    public async Task DeleteAsync_SetsIsActiveFalse()
    {
        var user = new User { Id = Guid.NewGuid(), IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(user.Id);

        _userRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => !u.IsActive)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_UserRole_OtherUserId_ThrowsForbiddenException()
    {
        var user = new User { Id = Guid.NewGuid(), IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            _sut.UpdateAsync(user.Id, new UpdateUserDto { Name = "X" }, Guid.NewGuid(), "user"));
    }

    [Fact]
    public async Task UpdateAsync_UserRole_OwnId_WithCorrectCurrentPassword_ChangesHash()
    {
        var id = Guid.NewGuid();
        var user = new User { Id = id, Name = "Old", PasswordHash = "oldhash", IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _password.Setup(p => p.Verify("correct", "oldhash")).Returns(true);
        _password.Setup(p => p.Hash("newpass12")).Returns("newhash");

        var dto = new UpdateUserDto { Name = "Old", CurrentPassword = "correct", NewPassword = "newpass12" };
        await _sut.UpdateAsync(id, dto, id, "user");

        _userRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => u.PasswordHash == "newhash")), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_UserRole_OwnId_WithWrongCurrentPassword_ThrowsUnauthorized()
    {
        var id = Guid.NewGuid();
        var user = new User { Id = id, Name = "Old", PasswordHash = "oldhash", IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(user);
        _password.Setup(p => p.Verify("wrong", "oldhash")).Returns(false);

        var dto = new UpdateUserDto { Name = "Old", CurrentPassword = "wrong", NewPassword = "newpass12" };

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _sut.UpdateAsync(id, dto, id, "user"));
    }

    [Fact]
    public async Task UpdateAsync_AdminRole_WithNewPasswordOnly_ChangesHash()
    {
        var userId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var user = new User { Id = userId, Name = "User", PasswordHash = "oldhash", IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _password.Setup(p => p.Hash("adminset1")).Returns("adminhash");

        var dto = new UpdateUserDto { Name = "User", NewPassword = "adminset1" };
        await _sut.UpdateAsync(userId, dto, adminId, "admin");

        _userRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => u.PasswordHash == "adminhash")), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_WithRoleAndIsActiveFilter_PassesParamsToRepository()
    {
        _userRepo.Setup(r => r.GetPagedAsync(null, "admin", true, 1, 10))
                 .ReturnsAsync((Enumerable.Empty<User>(), 0));

        await _sut.GetAllAsync(null, "admin", true, 1, 10);

        _userRepo.Verify(r => r.GetPagedAsync(null, "admin", true, 1, 10), Times.Once);
    }
}
