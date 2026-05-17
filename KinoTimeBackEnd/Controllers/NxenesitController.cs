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
    public class NxenesitController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public NxenesitController(CinemaDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Nxenesi>>> GetNxenesit()
        {
            return await _context.Nxenesit
                .Include(s => s.Shkolla)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Nxenesi>> GetNxenesi(int id)
        {
            var nxenesi = await _context.Nxenesit
                .Include(s => s.Shkolla)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (nxenesi == null)
                return NotFound();

            return nxenesi;
        }

        [HttpPost]
        public async Task<ActionResult<Nxenesi>> CreateNxenesi(Nxenesi nxenesi)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Nxenesit.Add(nxenesi);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNxenesi), new { id = nxenesi.Id }, nxenesi);
        }

        [HttpPut("{id}")]
         public async Task<IActionResult> UpdateNxenesi(int id, Nxenesi nxenesi)
        {
            if (id != nxenesi.Id)
                return BadRequest("ID nuk perputhet.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingNxenesi = await _context.Nxenesit.FindAsync(id);
            if (existingNxenesi == null)
                return NotFound();

            existingNxenesi.EmriNxenesit = nxenesi.EmriNxenesit;
            existingNxenesi.Klasa = nxenesi.Klasa;
            existingNxenesi.ShkollaId = nxenesi.ShkollaId;


            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNxenesi(int id)
        {
            var nxenesi = await _context.Nxenesit.FindAsync(id);
            if (nxenesi == null)
                return NotFound();

            _context.Nxenesit.Remove(nxenesi);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}