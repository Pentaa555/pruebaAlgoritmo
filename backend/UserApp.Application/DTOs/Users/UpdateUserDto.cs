namespace UserApp.Application.DTOs.Users;

public class UpdateUserDto
{
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Role { get; init; }
    public string? CurrentPassword { get; init; }
    public string? NewPassword { get; init; }
}
