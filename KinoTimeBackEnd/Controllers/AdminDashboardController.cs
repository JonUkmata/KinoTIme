using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;

namespace KinoTimeBackEnd.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public AdminDashboardController(CinemaDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var now = DateTime.UtcNow;
            var todayStart = now.Date;
            var tomorrow = todayStart.AddDays(1);
            var diff = (7 + (int)todayStart.DayOfWeek - (int)DayOfWeek.Monday) % 7;
            var weekStart = todayStart.AddDays(-diff);
            var weekEnd = weekStart.AddDays(7);

            var totalMovies = await _context.Movies.CountAsync();
            var totalHalls = await _context.Halls.CountAsync();
            var totalShowtimes = await _context.Showtimes.CountAsync();
            var totalReservations = await _context.Reservations.CountAsync();

            var activeReservations = await _context.Reservations.CountAsync(r =>
                r.Status == "Confirmed" || r.Status == "Active");
            var cancelledReservations = await _context.Reservations.CountAsync(r =>
                r.Status == "Cancelled" || r.Status == "Canceled");

            var reservationsToday = await _context.Reservations.CountAsync(r =>
                (r.Status == "Confirmed" || r.Status == "Active") &&
                r.CreatedAt >= todayStart && r.CreatedAt < tomorrow);
            var reservationsThisWeek = await _context.Reservations.CountAsync(r =>
                (r.Status == "Confirmed" || r.Status == "Active") &&
                r.CreatedAt >= weekStart && r.CreatedAt < weekEnd);

            var showtimesToday = await _context.Showtimes.CountAsync(s =>
                s.StartTime >= todayStart && s.StartTime < tomorrow);
            var showtimesThisWeek = await _context.Showtimes.CountAsync(s =>
                s.StartTime >= weekStart && s.StartTime < weekEnd);

            var revenueTotal = await _context.ReservationSeats
                .Where(rs => rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active")
                .SumAsync(rs => (decimal?)rs.Showtime.Price) ?? 0m;

            var revenueToday = await _context.ReservationSeats
                .Where(rs =>
                    (rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active") &&
                    rs.Reservation.CreatedAt >= todayStart && rs.Reservation.CreatedAt < tomorrow)
                .SumAsync(rs => (decimal?)rs.Showtime.Price) ?? 0m;

            var revenueThisWeek = await _context.ReservationSeats
                .Where(rs =>
                    (rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active") &&
                    rs.Reservation.CreatedAt >= weekStart && rs.Reservation.CreatedAt < weekEnd)
                .SumAsync(rs => (decimal?)rs.Showtime.Price) ?? 0m;

            var topMovies = await _context.Reservations
                .Where(r => r.Status == "Confirmed" || r.Status == "Active")
                .GroupBy(r => new { r.Showtime.MovieId, r.Showtime.Movie.Title })
                .Select(g => new
                {
                    movieId = g.Key.MovieId,
                    title = g.Key.Title,
                    reservationsCount = g.Count()
                })
                .OrderByDescending(x => x.reservationsCount)
                .Take(5)
                .ToListAsync();

            var topShowtimes = await _context.ReservationSeats
                .Where(rs => rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active")
                .GroupBy(rs => new
                {
                    rs.ShowtimeId,
                    MovieTitle = rs.Showtime.Movie.Title,
                    HallName = rs.Showtime.Hall.Name,
                    rs.Showtime.StartTime
                })
                .Select(g => new
                {
                    showtimeId = g.Key.ShowtimeId,
                    movieTitle = g.Key.MovieTitle,
                    hallName = g.Key.HallName,
                    startTime = g.Key.StartTime,
                    reservedSeats = g.Count()
                })
                .OrderByDescending(x => x.reservedSeats)
                .Take(5)
                .ToListAsync();

            var reservedByShowtime = await _context.ReservationSeats
                .Where(rs => rs.Reservation.Status == "Confirmed" || rs.Reservation.Status == "Active")
                .GroupBy(rs => rs.ShowtimeId)
                .Select(g => new { ShowtimeId = g.Key, ReservedSeats = g.Count() })
                .ToListAsync();

            var reservedMap = reservedByShowtime.ToDictionary(x => x.ShowtimeId, x => x.ReservedSeats);

            var showtimeBase = await _context.Showtimes
                .AsNoTracking()
                .Select(s => new
                {
                    s.Id,
                    s.MovieId,
                    MovieTitle = s.Movie.Title,
                    HallName = s.Hall.Name,
                    HallCapacity = s.Hall.Capacity,
                    s.StartTime
                })
                .ToListAsync();

            var occupancyByShowtime = showtimeBase
                .Select(s =>
                {
                    var reservedSeats = reservedMap.TryGetValue(s.Id, out var count) ? count : 0;
                    var totalSeats = s.HallCapacity > 0 ? s.HallCapacity : CinemaDbContext.StandardHallCapacity;
                    var occupancyPercent = totalSeats > 0
                        ? Math.Round((double)reservedSeats / totalSeats * 100, 2)
                        : 0;
                    return new
                    {
                        showtimeId = s.Id,
                        movieTitle = s.MovieTitle,
                        hallName = s.HallName,
                        startTime = s.StartTime,
                        reservedSeats,
                        totalSeats,
                        occupancyPercent
                    };
                })
                .OrderByDescending(x => x.occupancyPercent)
                .ThenByDescending(x => x.reservedSeats)
                .Take(10)
                .ToList();

            var avgOccupancyByMovie = showtimeBase
                .GroupBy(s => new { s.MovieId, s.MovieTitle })
                .Select(g =>
                {
                    var occupancies = g.Select(s =>
                    {
                        var reservedSeats = reservedMap.TryGetValue(s.Id, out var count) ? count : 0;
                        var totalSeats = s.HallCapacity > 0 ? s.HallCapacity : CinemaDbContext.StandardHallCapacity;
                        return totalSeats > 0 ? (double)reservedSeats / totalSeats * 100 : 0;
                    }).ToList();

                    var avg = occupancies.Count > 0 ? occupancies.Average() : 0;
                    return new
                    {
                        movieId = g.Key.MovieId,
                        title = g.Key.MovieTitle,
                        avgOccupancyPercent = Math.Round(avg, 2)
                    };
                })
                .OrderByDescending(x => x.avgOccupancyPercent)
                .Take(10)
                .ToList();

            var activePercent = totalReservations > 0
                ? Math.Round((double)activeReservations / totalReservations * 100, 2)
                : 0;
            var cancelledPercent = totalReservations > 0
                ? Math.Round((double)cancelledReservations / totalReservations * 100, 2)
                : 0;

            return Ok(new
            {
                totals = new
                {
                    movies = totalMovies,
                    halls = totalHalls,
                    showtimes = totalShowtimes,
                    reservations = totalReservations
                },
                reservations = new
                {
                    total = totalReservations,
                    active = activeReservations,
                    cancelled = cancelledReservations,
                    activePercent,
                    cancelledPercent,
                    today = reservationsToday,
                    thisWeek = reservationsThisWeek
                },
                showtimes = new
                {
                    today = showtimesToday,
                    thisWeek = showtimesThisWeek
                },
                revenue = new
                {
                    total = revenueTotal,
                    today = revenueToday,
                    thisWeek = revenueThisWeek
                },
                topMovies,
                topShowtimes,
                occupancyByShowtime,
                avgOccupancyByMovie
            });
        }
    }
}
