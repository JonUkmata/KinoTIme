using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShowtimesController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public ShowtimesController(CinemaDbContext context)
        {
            _context = context;
        }

        // ===================== HELPER =====================
        // Kontrollon nëse ka mbivendosje të shfaqjeve në të njëjtën sallë
        private async Task<bool> IsOverlappingAsync(Showtime showtime)
        {
            return await _context.Showtimes.AnyAsync(s =>
                s.HallId == showtime.HallId &&
                s.Id != showtime.Id &&
                s.StartTime < showtime.EndTime &&
                showtime.StartTime < s.EndTime);
        }

        // ===================== GET ALL (PUBLIC) =====================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Showtime>>> GetShowtimes()
        {
            return await _context.Showtimes
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .ToListAsync();
        }

        // ===================== GET BY ID (PUBLIC) =====================
        [HttpGet("{id}")]
        public async Task<ActionResult<Showtime>> GetShowtime(int id)
        {
            var showtime = await _context.Showtimes
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (showtime == null)
                return NotFound();

            return showtime;
        }

        // ===================== CREATE (ADMIN ONLY) =====================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Showtime>> CreateShowtime(ShowtimeCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.MovieId <= 0 || dto.HallId <= 0)
                return BadRequest("MovieId dhe HallId jane te detyrueshme.");

            if (dto.EndTime <= dto.StartTime)
                return BadRequest("EndTime duhet te jete me i madh se StartTime.");

            if (dto.Price <= 0)
                return BadRequest("Price duhet te jete me i madh se 0.");

            var movie = await _context.Movies.FindAsync(dto.MovieId);
            if (movie == null)
                return BadRequest("Filmi nuk ekziston.");

            var hall = await _context.Halls.FindAsync(dto.HallId);
            if (hall == null)
                return BadRequest("Salla nuk ekziston.");

            var showtime = new Showtime
            {
                MovieId = dto.MovieId,
                HallId = dto.HallId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Price = dto.Price,
                Movie = movie,
                Hall = hall
            };

            if (await IsOverlappingAsync(showtime))
                return BadRequest("Ka nje shfaqje tjeter ne kete salle ne kete kohe.");

            _context.Showtimes.Add(showtime);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, showtime);
        }

        // ===================== UPDATE (ADMIN ONLY) =====================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShowtime(int id, ShowtimeUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID nuk perputhet.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.MovieId <= 0 || dto.HallId <= 0)
                return BadRequest("MovieId dhe HallId jane te detyrueshme.");

            if (dto.EndTime <= dto.StartTime)
                return BadRequest("EndTime duhet te jete me i madh se StartTime.");

            if (dto.Price <= 0)
                return BadRequest("Price duhet te jete me i madh se 0.");

            var existingShowtime = await _context.Showtimes.FindAsync(id);
            if (existingShowtime == null)
                return NotFound();

            var movie = await _context.Movies.FindAsync(dto.MovieId);
            if (movie == null)
                return BadRequest("Filmi nuk ekziston.");

            var hall = await _context.Halls.FindAsync(dto.HallId);
            if (hall == null)
                return BadRequest("Salla nuk ekziston.");

            var overlapCheck = new Showtime
            {
                Id = id,
                MovieId = dto.MovieId,
                HallId = dto.HallId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Movie = movie,
                Hall = hall
            };

            if (await IsOverlappingAsync(overlapCheck))
                return BadRequest("Ka nje shfaqje tjeter ne kete salle ne kete kohe.");

            existingShowtime.StartTime = dto.StartTime;
            existingShowtime.EndTime = dto.EndTime;
            existingShowtime.MovieId = dto.MovieId;
            existingShowtime.HallId = dto.HallId;
            existingShowtime.Price = dto.Price;
            existingShowtime.Movie = movie;
            existingShowtime.Hall = hall;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ===================== DELETE (ADMIN ONLY) =====================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShowtime(int id)
        {
            var showtime = await _context.Showtimes.FindAsync(id);
            if (showtime == null)
                return NotFound();

            _context.Showtimes.Remove(showtime);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ShowtimeCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        public int HallId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price duhet te jete me i madh se 0.")]
        public decimal Price { get; set; }
    }

    public class ShowtimeUpdateDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public int MovieId { get; set; }

        [Required]
        public int HallId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price duhet te jete me i madh se 0.")]
        public decimal Price { get; set; }
    }
}

