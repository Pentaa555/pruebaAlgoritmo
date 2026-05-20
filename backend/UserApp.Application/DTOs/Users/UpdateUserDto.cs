using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Users;

public class UpdateUserDto
{
    [Required][MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [EmailAddress]
    public string? Email { get; init; }

    public string? Role { get; init; }

    [MinLength(8)]
    public string? Password { get; init; }
}
