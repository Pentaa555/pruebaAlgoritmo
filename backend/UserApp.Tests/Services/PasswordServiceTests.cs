using UserApp.Infrastructure.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class PasswordServiceTests
{
    private readonly PasswordService _sut = new();

    [Fact]
    public void Hash_ReturnsNonEmptyString()
    {
        var hash = _sut.Hash("password123");
        Assert.False(string.IsNullOrEmpty(hash));
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _sut.Hash("password123");
        Assert.True(_sut.Verify("password123", hash));
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("password123");
        Assert.False(_sut.Verify("wrong", hash));
    }

    [Fact]
    public void Hash_SamePasswordTwice_ReturnsDifferentHashes()
    {
        var hash1 = _sut.Hash("password123");
        var hash2 = _sut.Hash("password123");
        Assert.NotEqual(hash1, hash2);
    }
}
