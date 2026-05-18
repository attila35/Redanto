namespace Redanto.API.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }

    public AppException(int statusCode, string code, string message) : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message = "Resource not found.")
        : base(404, "NOT_FOUND", message) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message)
        : base(409, "CONFLICT", message) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized.")
        : base(401, "UNAUTHORIZED", message) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Forbidden.")
        : base(403, "FORBIDDEN", message) { }
}

public class ValidationException : AppException
{
    public ValidationException(string message)
        : base(400, "VALIDATION_ERROR", message) { }
}
