using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace KinoTimeBackEnd.Models
{
    public class Model1 // ← emri i entitetit kryesor
    {
        public int Id { get; set; }

        [Required]
        public required string Fusha1 { get; set; } // ← fusha 1

        [Required]
        public required string Fusha2 { get; set; } // ← fusha 2

        [Required]
        public required string Fusha3 { get; set; } // ← fusha 3 (nëse ka)

        [JsonIgnore]
        public ICollection<Model2> Model2t { get; set; } = new List<Model2>();
    }
}