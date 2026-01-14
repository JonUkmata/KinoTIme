using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace KinoTimeBackEnd.Models
{
    public class Movie
    {
       
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public string Description { get; set; } = string.Empty;

        public int ReleaseYear { get; set; }

        public string Genre { get; set; } = string.Empty;

        // Duration in minutes
        public int Duration { get; set; }

        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}