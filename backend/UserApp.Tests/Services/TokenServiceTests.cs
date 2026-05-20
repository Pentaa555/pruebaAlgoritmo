using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using UserApp.Infrastructure.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _sut;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-key-for-tests-that-is-at-least-32-chars",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Jwt:ExpiryMinutes"] = "30"
            })
            .Build();
        _sut = new TokenService(config);
    }

    [Fact]
    public void GenerateAccessToken_ReturnsNonEmptyString()
    {
        var token = _sut.GenerateAccessToken(Guid.NewGuid(), "user");
        Assert.False(string.IsNullOrEmpty(token));
    }

    [Fact]
    public void GenerateAccessToken_ContainsUserIdAndRole()
    {
        var userId = Guid.NewGuid();
        var token = _sut.GenerateAccessToken(userId, "admin");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal(userId.ToString(), jwt.Subject);
        Assert.Contains(jwt.Claims, c => c.Value == "admin");
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsDifferentValuesEachCall()
    {
        var t1 = _sut.GenerateRefreshToken();
        var t2 = _sut.GenerateRefreshToken();
        Assert.NotEqual(t1, t2);
    }
}
