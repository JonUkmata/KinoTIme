using System.ComponentModel.DataAnnotations;

namespace KinoTimeBackEnd.Models
{
    public class User
    {
        public User()
        {
            Email = string.Empty;
            Username = string.Empty;
            PasswordHash = string.Empty;
            Role = string.Empty;
            RefreshTokens = new List<RefreshToken>();
        }
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; } // "Admin" ose "User"

        // Navigation property for one-to-many relationship
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}