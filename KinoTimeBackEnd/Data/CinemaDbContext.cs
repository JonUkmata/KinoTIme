using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Data
{
    public class CinemaDbContext : DbContext
    {
        public CinemaDbContext(DbContextOptions<CinemaDbContext> options) : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Hall> Halls { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }

    }
}
