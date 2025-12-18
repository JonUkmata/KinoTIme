using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class Showtime
    {
        public int Id { get; set; }

        [Required]
        public int MovieId { get; set; }

        [ForeignKey("MovieId")]
        public required Movie Movie { get; set; }

        [Required]
        public int HallId { get; set; }

        [ForeignKey("HallId")] // Navigation property (Foreign keys dhe  Kufizimet jane vetem te implemtuara direkt ne krijimin e modeleve pra nuk ka nevoj ne CinemaDBContext me specifiku lidhjet dhe kufizimet)
        
        public required Hall Hall { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
    }
}
