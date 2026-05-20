using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using UserApp.Application.Exceptions;

namespace UserApp.Api.Filters;

public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, message) = context.Exception switch
        {
            ConflictException e     => (409, e.Message),
            UnauthorizedException e => (401, e.Message),
            ForbiddenException e    => (403, e.Message),
            NotFoundException e     => (404, e.Message),
            _                       => (500, "An unexpected error occurred.")
        };

        if (status == 500)
            logger.LogError(context.Exception, "Unhandled exception");
        else if (status is 403 or 409)
            logger.LogWarning(context.Exception, "Request rejected with {Status}", status);

        context.Result = new ObjectResult(new { status, message, errors = new { } }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
