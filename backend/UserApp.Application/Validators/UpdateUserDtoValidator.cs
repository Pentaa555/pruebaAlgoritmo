using FluentValidation;
using UserApp.Application.DTOs.Users;

namespace UserApp.Application.Validators;

public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        When(x => x.Email != null, () =>
            RuleFor(x => x.Email).EmailAddress());
        When(x => x.NewPassword != null, () =>
            RuleFor(x => x.NewPassword).MinimumLength(8));
        When(x => x.Role != null, () =>
            RuleFor(x => x.Role).Must(r => r == "admin" || r == "user")
                .WithMessage("Role must be 'admin' or 'user'."));
    }
}
