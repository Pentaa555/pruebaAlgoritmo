namespace UserApp.Application.Interfaces;
public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string role);
    string GenerateRefreshToken();
}
