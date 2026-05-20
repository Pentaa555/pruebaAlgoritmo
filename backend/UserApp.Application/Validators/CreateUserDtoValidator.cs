using FluentValidation;
using UserApp.Application.DTOs.Users;

namespace UserApp.Application.Validators;

public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Role).NotEmpty().Must(r => r == "admin" || r == "user")
            .WithMessage("Role must be 'admin' or 'user'.");
    }
}
