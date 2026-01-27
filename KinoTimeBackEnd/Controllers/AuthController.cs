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
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = User.FindFirst("UserId")?.Value;
            var username = User.FindFirst("Username")?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return Ok(new { userId, username, role });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("kinotime_auth", new CookieOptions { Path = "/" });
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
