using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<ActionResult<Showtime>> CreateShowtime(Showtime showtime)
        {
            if (showtime.MovieId <= 0 || showtime.HallId <= 0)
                return BadRequest("MovieId dhe HallId janë të detyrueshme.");

            if (!await _context.Movies.AnyAsync(m => m.Id == showtime.MovieId))
                return BadRequest("Filmi nuk ekziston.");

            if (!await _context.Halls.AnyAsync(h => h.Id == showtime.HallId))
                return BadRequest("Salla nuk ekziston.");

            if (await IsOverlappingAsync(showtime))
                return BadRequest("Ka një shfaqje tjetër në këtë sallë në këtë kohë.");

            _context.Showtimes.Add(showtime);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, showtime);
        }

        // ===================== UPDATE (ADMIN ONLY) =====================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShowtime(int id, Showtime showtime)
        {
            if (id != showtime.Id)
                return BadRequest("ID nuk përputhet.");

            var existingShowtime = await _context.Showtimes.FindAsync(id);
            if (existingShowtime == null)
                return NotFound();

            if (await IsOverlappingAsync(showtime))
                return BadRequest("Ka një shfaqje tjetër në këtë sallë në këtë kohë.");

            existingShowtime.StartTime = showtime.StartTime;
            existingShowtime.MovieId = showtime.MovieId;
            existingShowtime.HallId = showtime.HallId;

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
}

