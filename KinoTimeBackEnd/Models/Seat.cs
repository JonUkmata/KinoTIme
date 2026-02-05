using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class Seat
    {
        public int Id { get; set; }

        [Required]
        public int HallId { get; set; }

        [Required]
        public required string Row { get; set; }

        [Required]
        public int Number { get; set; }

        [ForeignKey("HallId")]
        public required Hall Hall { get; set; }
    }
}
