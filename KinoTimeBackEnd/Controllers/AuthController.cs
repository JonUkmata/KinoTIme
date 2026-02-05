using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using KinoTimeBackEnd.Models;
using KinoTimeBackEnd.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using KinoTimeBackEnd.Services;
using Microsoft.Extensions.Configuration;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CinemaDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _config;
        public AuthController(CinemaDbContext context, JwtService jwtService, IConfiguration config)
        {
            _context = context;
            _jwtService = jwtService;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest(new { message = "Username already exists" });

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = HashPassword(dto.Password),
                Email = dto.Email,
                Role = "User"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User registered" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var identifier = (dto.Username ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(identifier))
                return Unauthorized("Invalid credentials");

            var user = await _context.Users.FirstOrDefaultAsync(
                u => u.Username == identifier || u.Email == identifier);
            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var token = _jwtService.GenerateToken(user);
            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var min) ? min : 60;
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(expireMinutes),
                Path = "/"
            };
            Response.Cookies.Append("kinotime_auth", token, cookieOptions);
            await RotateRefreshTokenAsync(user.Id);
            return Ok(new { token });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("kinotime_refresh", out var refreshToken))
                return Unauthorized("Missing refresh token");

            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null || storedToken.ExpirationDate <= DateTime.UtcNow)
            {
                if (storedToken != null)
                {
                    _context.RefreshTokens.Remove(storedToken);
                    await _context.SaveChangesAsync();
                }
                ClearAuthCookies();
                return Unauthorized("Invalid refresh token");
            }

            var user = storedToken.User;
            var accessToken = _jwtService.GenerateToken(user);
            SetAccessCookie(accessToken);
            await RotateRefreshTokenAsync(user.Id, storedToken);

            return Ok(new { token = accessToken });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.Username, u.Email, u.Role })
                .FirstOrDefaultAsync();

            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            });
        }

        [Authorize]
        [HttpGet("sessions")]
        public async Task<IActionResult> Sessions()
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var currentRefresh = Request.Cookies.TryGetValue("kinotime_refresh", out var cookieToken)
                ? cookieToken
                : null;

            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId)
                .ToListAsync();

            var sessions = tokens.Select(rt => new
            {
                rt.Id,
                rt.ExpirationDate,
                IsCurrent = currentRefresh != null && rt.Token == currentRefresh
            });

            return Ok(sessions);
        }

        [Authorize]
        [HttpPost("revoke/{id}")]
        public async Task<IActionResult> Revoke(int id)
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Id == id && rt.UserId == userId);

            if (token == null)
                return NotFound();

            _context.RefreshTokens.Remove(token);
            await _context.SaveChangesAsync();

            if (Request.Cookies.TryGetValue("kinotime_refresh", out var current) && current == token.Token)
            {
                ClearAuthCookies();
            }

            return Ok(new { message = "Session revoked" });
        }

        [Authorize]
        [HttpPost("revoke-all")]
        public async Task<IActionResult> RevokeAll()
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var tokens = _context.RefreshTokens.Where(rt => rt.UserId == userId);
            _context.RefreshTokens.RemoveRange(tokens);
            await _context.SaveChangesAsync();

            ClearAuthCookies();

            return Ok(new { message = "All sessions revoked" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            if (Request.Cookies.TryGetValue("kinotime_refresh", out var refreshToken))
            {
                var storedToken = _context.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
                if (storedToken != null)
                {
                    _context.RefreshTokens.Remove(storedToken);
                    _context.SaveChanges();
                }
            }

            ClearAuthCookies();
            return Ok(new { message = "Logged out" });
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == storedHash;
        }

        private int GetRefreshDays()
        {
            return int.TryParse(_config["Jwt:RefreshDays"], out var days) ? days : 7;
        }

        private string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes);
        }

        private void SetAccessCookie(string token)
        {
            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var min) ? min : 60;
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(expireMinutes),
                Path = "/"
            };
            Response.Cookies.Append("kinotime_auth", token, cookieOptions);
        }

        private void SetRefreshCookie(string refreshToken)
        {
            var refreshDays = GetRefreshDays();
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(refreshDays),
                Path = "/"
            };
            Response.Cookies.Append("kinotime_refresh", refreshToken, cookieOptions);
        }

        private void ClearAuthCookies()
        {
            Response.Cookies.Delete("kinotime_auth", new CookieOptions { Path = "/" });
            Response.Cookies.Delete("kinotime_refresh", new CookieOptions { Path = "/" });
        }

        private async Task RotateRefreshTokenAsync(int userId, RefreshToken existingToken = null)
        {
            var refreshDays = GetRefreshDays();
            var newTokenValue = GenerateRefreshToken();
            var newExpiry = DateTime.UtcNow.AddDays(refreshDays);

            if (existingToken != null)
            {
                existingToken.Token = newTokenValue;
                existingToken.ExpirationDate = newExpiry;
                _context.RefreshTokens.Update(existingToken);
            }
            else
            {
                var tokens = _context.RefreshTokens.Where(rt => rt.UserId == userId);
                _context.RefreshTokens.RemoveRange(tokens);
                await _context.SaveChangesAsync();

                _context.RefreshTokens.Add(new RefreshToken
                {
                    UserId = userId,
                    Token = newTokenValue,
                    ExpirationDate = newExpiry
                });
            }

            await _context.SaveChangesAsync();
            SetRefreshCookie(newTokenValue);
        }
    }

    public class UserRegisterDto
    {
        public UserRegisterDto()
        {
            Username = string.Empty;
            Password = string.Empty;
            Email = string.Empty;
        }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
    }
    public class UserLoginDto
    {
        public UserLoginDto()
        {
            Username = string.Empty;
            Password = string.Empty;
        }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
