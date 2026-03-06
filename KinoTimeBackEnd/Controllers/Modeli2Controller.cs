using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Data;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Model2Controller : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public Model2Controller(CinemaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Model2>>> GetModel2t()
        {
            return await _context.Model2t
                .Include(x => x.Model1  ) // ← navigation property
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Model2>> GetModel2(int id)
        {
            var item = await _context.Model2t
                .Include(x => x.Model1  ) // ← navigation property  
                .FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<Model2>> CreateModel2(Model2 item)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Model2t.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetModel2), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateModel2(int id, Model2 item)
        {
            if (id != item.Id) return BadRequest("ID nuk përputhet.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _context.Model2t.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Fusha1 = item.Fusha1; // ← ndrysho fushat
            existing.Fusha2 = item.Fusha2;
            existing.Model1ID = item.Model1ID; // ← FK

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModel2(int id)
        {
            var item = await _context.Model2t.FindAsync(id);
            if (item == null) return NotFound();
            _context.Model2t.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}