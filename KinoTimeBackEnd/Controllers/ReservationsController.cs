using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public ReservationsController(CinemaDbContext context)
        {
            _context = context;
        }

        // GET: api/Reservations/seatmap/{showtimeId}
        [HttpGet("seatmap/{showtimeId}")]
        public async Task<IActionResult> GetSeatMap(int showtimeId)
        {
            var hallId = await _context.Showtimes
                .AsNoTracking()
                .Where(s => s.Id == showtimeId)
                .Select(s => (int?)s.HallId)
                .FirstOrDefaultAsync();

            if (hallId == null)
                return NotFound("Showtime nuk ekziston.");

            var seats = await _context.Seats
                .AsNoTracking()
                .Where(s => s.HallId == hallId.Value)
                .OrderBy(s => s.Row)
                .ThenBy(s => s.Number)
                .Select(s => new SeatMapSeatDto
                {
                    Id = s.Id,
                    Row = s.Row,
                    Number = s.Number
                })
                .ToListAsync();

            var reservedSeatIds = await _context.ReservationSeats
                .AsNoTracking()
                .Where(rs => rs.ShowtimeId == showtimeId &&
                             (rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active"))
                .Select(rs => rs.SeatId)
                .Distinct()
                .ToListAsync();

            var rows = seats
                .Select(s => s.Row)
                .Distinct()
                .OrderBy(r => r)
                .ToList();

            var response = new SeatMapResponseDto
            {
                Rows = rows,
                Seats = seats,
                ReservedSeatIds = reservedSeatIds
            };

            return Ok(response);
        }
    }

    public class SeatMapSeatDto
    {
        public int Id { get; set; }
        public string Row { get; set; } = string.Empty;
        public int Number { get; set; }
    }

    public class SeatMapResponseDto
    {
        public List<string> Rows { get; set; } = new List<string>();
        public List<SeatMapSeatDto> Seats { get; set; } = new List<SeatMapSeatDto>();
        public List<int> ReservedSeatIds { get; set; } = new List<int>();
    }
}
