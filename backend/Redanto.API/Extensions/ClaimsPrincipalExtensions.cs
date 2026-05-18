using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Redanto.API.Exceptions;

namespace Redanto.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (sub is null || !int.TryParse(sub, out var id))
            throw new UnauthorizedException("Invalid token: missing user id.");
        return id;
    }
}
