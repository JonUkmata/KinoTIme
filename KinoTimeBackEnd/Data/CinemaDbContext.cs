using Microsoft.EntityFrameworkCore;
using KinoTimeBackEnd.Models;

namespace KinoTimeBackEnd.Data
{
    public class CinemaDbContext : DbContext
    {
        public const int StandardHallRows = 10;
        public const int StandardSeatsPerRow = 12;
        public const int StandardHallCapacity = StandardHallRows * StandardSeatsPerRow;

        public CinemaDbContext(DbContextOptions<CinemaDbContext> options) : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Hall> Halls { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationSeat> ReservationSeats { get; set; }

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

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.UserId);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.ShowtimeId);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Showtime)
                .WithMany()
                .HasForeignKey(r => r.ShowtimeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReservationSeat>()
                .HasIndex(rs => new { rs.ShowtimeId, rs.SeatId })
                .IsUnique();

            modelBuilder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Reservation)
                .WithMany(r => r.ReservationSeats)
                .HasForeignKey(rs => rs.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Seat)
                .WithMany()
                .HasForeignKey(rs => rs.SeatId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Showtime)
                .WithMany()
                .HasForeignKey(rs => rs.ShowtimeId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
