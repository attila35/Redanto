using System.ComponentModel.DataAnnotations;

namespace Redanto.API.DTOs;

public record RegisterRequest(
    [Required, StringLength(50, MinimumLength = 3)] string Username,
    [Required, EmailAddress, StringLength(255)] string Email,
    [Required, StringLength(100, MinimumLength = 6)] string Password
);

public record LoginRequest(
    [Required] string Identifier,
    [Required] string Password
);

public record UserDto(
    int Id, 
    string Username, 
    string Email, 
    DateTime CreatedAt
    );

public record AuthResponse(
    UserDto User, 
    string Token
    );
