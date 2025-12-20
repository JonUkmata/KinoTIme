using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Showtime>>> GetShowtimes() //Kjo eshte nje metod asinkrone qe kthen nje liste te te gjitha shfaqjeve duke perfshire edhe info te filmave dhe sallave. ActionResult eshte nje klase qe kthen rezultatet ose nje Http response si 404 nese nuk gjendet asgje.ToListAsync() eshte nje metode asinkrone qe kthen nje liste nga query qe kemi.Await perdoret per te pritur perfundimin e nje operacioni asinkron pa bllokuar thread-in.
        {
            return await _context.Showtimes
                .Include(s => s.Movie)  
                .Include(s => s.Hall)
                .ToListAsync();
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<Showtime>> GetShowtime(int id) //Kjo metode merr nje shfaqje te vetme bazuar ne ID e saj dhe perfshin informacionin e lidhur te filmit dhe salles.FirstOrDefaultAsync() kthen elementin e pare qe perputhet me kushtin ose null nese nuk gjendet asgje.
        {
            var showtime = await _context.Showtimes
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (showtime == null)
            {
                return NotFound();
            }

            return showtime;
        }

        
        [HttpPost]
        public async Task<ActionResult<Showtime>> CreateShowtime(Showtime showtime) //Krijon nje shfaqje te re ne databaze.Kontrollon qe MovieId dhe HallId ekzistojne nese jo kthen nje mesazh qe jane te detyrushme.Kontrollon a ekziston filmi me ate ID nese nuk ekziston kthen nje mesazh qe nuk ekziston njejet edhe per hallin.E shton ne memorje dhe e ruan ne databaze pastaj kthen nje response me statusin 201 Created dhe te dhenat e shfaqjes se krijuar.
        {
            if (showtime.MovieId <= 0 || showtime.HallId <= 0)
            {
                return BadRequest("MovieId dhe HallId janë të detyrueshme.");
            }

            var movieExists = await _context.Movies.AnyAsync(m => m.Id == showtime.MovieId);
            if (!movieExists)
            {
                return BadRequest("Filmi nuk ekziston.");
            }

            var hallExists = await _context.Halls.AnyAsync(h => h.Id == showtime.HallId);
            if (!hallExists)
            {
                return BadRequest("Salla nuk ekziston.");
            }

            _context.Showtimes.Add(showtime);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, showtime);
        }

       
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShowtime(int id, Showtime showtime) //Perditeson nje shfaqje ekzistuese bazuar ne ID e saj.Kontrollon nese ID ne URL perputhet me ID ne trupin e kerkeses nese jo kthen BadRequest.Kontrollon nese shfaqja ekziston nese jo kthen NotFound.Pastaj perditeson vetem fushat e lejuara (StartTime, MovieId, HallId) dhe ruan ndryshimet ne databaze.Kthen NoContent() per te treguar qe operacioni ishte i suksesshem pa kthej asnje te dhene.
        {
            if (id != showtime.Id)
            {
                return BadRequest();
            }

            var existingShowtime = await _context.Showtimes.FindAsync(id);
            if (existingShowtime == null)
            {
                return NotFound();
            }

            existingShowtime.StartTime = showtime.StartTime;
            existingShowtime.MovieId = showtime.MovieId;
            existingShowtime.HallId = showtime.HallId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

       
        [HttpDelete("{id}")] // Fshin nje shfaqje bazuar ne ID e saj.Gjen shfaqjen ne databaze nese nuk ekziston kthen NotFound.Nese ekziston e heq nga databaza dhe ruan ndryshimet.Kthen NoContent() per te treguar qe operacioni ishte i suksesshem pa kthej asnje te dhene.
        public async Task<IActionResult> DeleteShowtime(int id)
        {
            var showtime = await _context.Showtimes.FindAsync(id);

            if (showtime == null)
            {
                return NotFound();
            }

            _context.Showtimes.Remove(showtime);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
