using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;
        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            var key = _config["Jwt:Key"] ?? "supersecretkey12345678901234567890";
            var issuer = _config["Jwt:Issuer"] ?? "KinoTimeIssuer";
            var audience = _config["Jwt:Audience"] ?? "MyAppUsers";
            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var min) ? min : 60;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("Username", user.Username)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
