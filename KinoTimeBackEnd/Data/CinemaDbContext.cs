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
        public DbSet<Seat> Seats { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure one-to-many: User → RefreshTokens
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Seat>()
                .HasIndex(s => new { s.HallId, s.Row, s.Number })
                .IsUnique();

            modelBuilder.Entity<Seat>()
                .HasIndex(s => s.HallId);

            modelBuilder.Entity<Seat>()
                .HasOne(s => s.Hall)
                .WithMany()
                .HasForeignKey(s => s.HallId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}
