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
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(_userRepo.Object, _password.Object);
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
}
