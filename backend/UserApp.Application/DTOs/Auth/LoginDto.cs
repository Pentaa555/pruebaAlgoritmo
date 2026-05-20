using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Auth;

public class LoginDto
{
    [Required][EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
