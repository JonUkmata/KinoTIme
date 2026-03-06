using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Model1tController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public Model1tController(CinemaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Model1>>> GetModel1t()
        {
            return await _context.Model1t.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Model1>> GetModel1(int id)
        {
            var item = await _context.Model1t.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<Model1>> CreateModel1(Model1 item)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Model1t.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetModel1), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateModel1(int id, Model1 item)
        {
            if (id != item.Id) return BadRequest("ID nuk përputhet.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _context.Model1t.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Fusha1 = item.Fusha1; // ← ndrysho fushat
            existing.Fusha2 = item.Fusha2;
            existing.Fusha3 = item.Fusha3;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModel1(int id)
        {
            var item = await _context.Model1t   .FindAsync(id);
            if (item == null) return NotFound();
            _context.Model1t.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}