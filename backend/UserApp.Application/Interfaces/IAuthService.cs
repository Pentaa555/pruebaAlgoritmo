using UserApp.Application.DTOs.Auth;
namespace UserApp.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<LoginResponseDto> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}
