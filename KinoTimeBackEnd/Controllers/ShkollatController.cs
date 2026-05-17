using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShkollatController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public ShkollatController(CinemaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Shkolla>>> GetShkollat()
        {
            return await _context.Shkollat.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Shkolla>> GetShkolla(int id)
        {
            var shkolla = await _context.Shkollat.FindAsync(id);
            if (shkolla == null)
                return NotFound();

            return shkolla;
        }

        [HttpPost]
        public async Task<ActionResult<Shkolla>> CreateShkolla(Shkolla shkolla)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Shkollat.Add(shkolla);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShkolla), new { id = shkolla.Id }, shkolla);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShkolla(int id, Shkolla shkolla)
        {
            if (id != shkolla.Id)
                return BadRequest("ID nuk perputhet.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingShkolla = await _context.Shkollat.FindAsync(id);
            if (existingShkolla == null)
                return NotFound();

            existingShkolla.EmriShkolles = shkolla.EmriShkolles;
            existingShkolla.Qyteti = shkolla.Qyteti;


            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShkolla(int id)
        {
            var shkolla = await _context.Shkollat.FindAsync(id);
            if (shkolla == null)
                return NotFound();

            _context.Shkollat.Remove(shkolla);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
