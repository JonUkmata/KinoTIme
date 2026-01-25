using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Controllers
{
    [Authorize] // Çdo endpoint kërkon autentikim
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public MoviesController(CinemaDbContext context)
        {
            _context = context;
        }

        // ===================== GET ALL =====================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            return await _context.Movies.ToListAsync();
        }

        // ===================== GET BY ID =====================
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
                return NotFound();

            return movie;
        }

        // ===================== CREATE (Admin only) =====================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Movie>> CreateMovie(Movie movie)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
        }

        // ===================== UPDATE (Admin only) =====================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, Movie movie)
        {
            if (id != movie.Id)
                return BadRequest("ID nuk përputhet.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingMovie = await _context.Movies.FindAsync(id);
            if (existingMovie == null)
                return NotFound();

            existingMovie.Title = movie.Title;
            existingMovie.Genre = movie.Genre;
            existingMovie.Description = movie.Description;
            existingMovie.ReleaseYear = movie.ReleaseYear;
            existingMovie.Duration = movie.Duration;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ===================== DELETE (Admin only) =====================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
                return NotFound();

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

