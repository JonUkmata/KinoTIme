using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

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

        // POST: api/Reservations
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.SeatIds == null || dto.SeatIds.Count == 0)
                return BadRequest("SeatIds jane te detyrueshme.");

            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            var showtime = await _context.Showtimes.FindAsync(dto.ShowtimeId);
            if (showtime == null)
                return NotFound("Showtime nuk ekziston.");

            var seatIds = dto.SeatIds.Distinct().ToList();
            if (seatIds.Count != dto.SeatIds.Count)
                return BadRequest("SeatIds permban dublime.");

            if (seatIds.Any(id => id <= 0))
                return BadRequest("SeatIds jo valide.");

            var seats = await _context.Seats
                .Where(s => s.HallId == showtime.HallId && seatIds.Contains(s.Id))
                .ToListAsync();

            if (seats.Count != seatIds.Count)
            {
                var validSeatIds = seats.Select(s => s.Id).ToList();
                var invalidSeatIds = seatIds.Except(validSeatIds).ToList();
                return BadRequest(new { message = "SeatIds jo valide per kete salle.", invalidSeatIds });
            }

            var alreadyReserved = await _context.ReservationSeats
                .AsNoTracking()
                .Where(rs => rs.ShowtimeId == dto.ShowtimeId &&
                             (rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active") &&
                             seatIds.Contains(rs.SeatId))
                .Select(rs => rs.SeatId)
                .Distinct()
                .ToListAsync();

            if (alreadyReserved.Count > 0)
                return Conflict(new { message = "Disa ulese jane tashme te rezervuara.", reservedSeatIds = alreadyReserved });

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var reservation = new Reservation
                {
                    UserId = userId,
                    User = user,
                    ShowtimeId = dto.ShowtimeId,
                    Showtime = showtime,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Confirmed"
                };

                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();

                var reservationSeats = seats.Select(seat => new ReservationSeat
                {
                    ReservationId = reservation.Id,
                    Reservation = reservation,
                    SeatId = seat.Id,
                    Seat = seat,
                    ShowtimeId = dto.ShowtimeId,
                    Showtime = showtime
                }).ToList();

                _context.ReservationSeats.AddRange(reservationSeats);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    reservationId = reservation.Id,
                    seats = reservationSeats.Select(rs => rs.SeatId).ToList()
                });
            }
            catch (DbUpdateException)
            {
                await transaction.RollbackAsync();
                return Conflict(new { message = "Rezervimi nuk u krye sepse disa ulese jane rezervuar." });
            }
        }

        // GET: api/Reservations/my
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReservations()
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var reservations = await _context.Reservations
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s.Hall)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var result = reservations.Select(r => new MyReservationDto
            {
                ReservationId = r.Id,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                MovieTitle = r.Showtime.Movie.Title,
                ShowtimeStartTime = r.Showtime.StartTime,
                HallName = r.Showtime.Hall.Name,
                SeatLabels = r.ReservationSeats
                    .OrderBy(rs => rs.Seat.Row)
                    .ThenBy(rs => rs.Seat.Number)
                    .Select(rs => $"{rs.Seat.Row}{rs.Seat.Number}")
                    .ToList()
            }).ToList();

            return Ok(result);
        }

        // POST: api/Reservations/{id}/cancel
        [Authorize]
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out var userId))
                return Unauthorized();

            var reservation = await _context.Reservations
                .Include(r => r.ReservationSeats)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound();

            if (reservation.UserId != userId)
                return Forbid();

            if (reservation.Status == "Cancelled")
                return BadRequest(new { message = "Rezervimi eshte anuluar." });

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                reservation.Status = "Cancelled";

                if (reservation.ReservationSeats.Count > 0)
                {
                    _context.ReservationSeats.RemoveRange(reservation.ReservationSeats);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Rezervimi u anulua." });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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

    public class ReservationCreateDto
    {
        [Required]
        public int ShowtimeId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "SeatIds jane te detyrueshme.")]
        public List<int> SeatIds { get; set; } = new List<int>();
    }

    public class MyReservationDto
    {
        public int ReservationId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public DateTime ShowtimeStartTime { get; set; }
        public string HallName { get; set; } = string.Empty;
        public List<string> SeatLabels { get; set; } = new List<string>();
    }
}
