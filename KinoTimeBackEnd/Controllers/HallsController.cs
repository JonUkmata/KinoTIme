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
        private const int StandardHallRows = CinemaDbContext.StandardHallRows;
        private const int StandardSeatsPerRow = CinemaDbContext.StandardSeatsPerRow;
        private const int StandardHallCapacity = CinemaDbContext.StandardHallCapacity;

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
            hall.Capacity = StandardHallCapacity;
            ModelState.Remove(nameof(Hall.Capacity));
            ModelState.Remove($"{nameof(hall)}.{nameof(Hall.Capacity)}");

            hall.Capacity = StandardHallCapacity;
            ModelState.Remove(nameof(Hall.Capacity));
            ModelState.Remove($"{nameof(hall)}.{nameof(Hall.Capacity)}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            _context.Halls.Add(hall);
            await _context.SaveChangesAsync();

            var hasSeats = await _context.Seats
                .AsNoTracking()
                .AnyAsync(s => s.HallId == hall.Id);

            if (!hasSeats)
            {
                var seats = new List<Seat>(StandardHallCapacity);

                for (var rowIndex = 0; rowIndex < StandardHallRows; rowIndex++)
                {
                    var rowLabel = ((char)('A' + rowIndex)).ToString();
                    for (var seatNumber = 1; seatNumber <= StandardSeatsPerRow; seatNumber++)
                    {
                        seats.Add(new Seat
                        {
                            HallId = hall.Id,
                            Hall = hall,
                            Row = rowLabel,
                            Number = seatNumber
                        });
                    }
                }

                _context.Seats.AddRange(seats);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

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
            existingHall.Capacity = StandardHallCapacity;

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
