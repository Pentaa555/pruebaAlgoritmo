using FluentValidation;
using UserApp.Application.DTOs.Auth;

namespace UserApp.Application.Validators;

public class RefreshDtoValidator : AbstractValidator<RefreshDto>
{
    public RefreshDtoValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
