using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class Model2 // ← emri i entitetit dytësor
    {
        public int Id { get; set; }

        [Required]
        public required string Fusha1 { get; set; } // ← fusha 1

        [Required]
        public required string Fusha2 { get; set; } // ← fusha 2 (nëse ka)

        [Required]
        public int Model1ID { get; set; } // ← FK

        [ForeignKey("Model1ID")]
        public Model1? Model1 { get; set; }
    }
}