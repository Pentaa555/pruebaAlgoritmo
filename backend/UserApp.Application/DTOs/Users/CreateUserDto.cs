using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Users;

public class CreateUserDto
{
    [Required][MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required][EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required][MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [Required]
    public string Role { get; init; } = "user";
}
