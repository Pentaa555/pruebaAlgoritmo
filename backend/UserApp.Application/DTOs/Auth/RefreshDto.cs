using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Auth;

public class RefreshDto
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}
