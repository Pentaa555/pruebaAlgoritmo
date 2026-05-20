namespace UserApp.Application.DTOs.Auth;
public record LoginResponseDto(string AccessToken, string RefreshToken, UserResponseDto User);

public record UserResponseDto(Guid Id, string Name, string Email, string Role, DateTime CreatedAt);
