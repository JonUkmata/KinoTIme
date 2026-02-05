using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public required User User { get; set; }

        [Required]
        public int ShowtimeId { get; set; }

        [ForeignKey("ShowtimeId")]
        public required Showtime Showtime { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public required string Status { get; set; }

        public ICollection<ReservationSeat> ReservationSeats { get; set; } = new List<ReservationSeat>();
    }
}
