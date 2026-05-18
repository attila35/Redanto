using Redanto.API.DTOs;

namespace Redanto.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserDto?> GetCurrentUserAsync(int userId, CancellationToken ct = default);
}
