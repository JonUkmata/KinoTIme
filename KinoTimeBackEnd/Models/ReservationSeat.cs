using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class ReservationSeat
    {
        public int Id { get; set; }

        [Required]
        public int ReservationId { get; set; }

        [ForeignKey("ReservationId")]
        public required Reservation Reservation { get; set; }

        [Required]
        public int SeatId { get; set; }

        [ForeignKey("SeatId")]
        public required Seat Seat { get; set; }

        [Required]
        public int ShowtimeId { get; set; }

        [ForeignKey("ShowtimeId")]
        public required Showtime Showtime { get; set; }
    }
}
