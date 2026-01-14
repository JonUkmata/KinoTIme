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
    public class HallsController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public HallsController(CinemaDbContext context)
        {
            _context = context;
        }

        // GET: api/halls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Hall>>> GetHalls()
        {
            return await _context.Halls.ToListAsync();
        }

        // GET: api/halls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Hall>> GetHall(int id)
        {
            var hall = await _context.Halls.FindAsync(id);

            if (hall == null)
                return NotFound();

            return hall;
        }

        // POST: api/halls (Vetëm Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Hall>> CreateHall(Hall hall)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Halls.Add(hall);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHall), new { id = hall.Id }, hall);
        }

        // PUT: api/halls/5 (Vetëm Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHall(int id, Hall hall)
        {
            if (id != hall.Id)
                return BadRequest("ID nuk përputhet.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingHall = await _context.Halls.FindAsync(id);
            if (existingHall == null)
                return NotFound();

            existingHall.Name = hall.Name;
            existingHall.Capacity = hall.Capacity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/halls/5 (Vetëm Admin)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHall(int id)
        {
            var hall = await _context.Halls.FindAsync(id);

            if (hall == null)
                return NotFound();

            _context.Halls.Remove(hall);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
