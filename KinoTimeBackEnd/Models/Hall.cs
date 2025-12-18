using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KinoTimeBackEnd.Models
{
    public class Hall
    {
      
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        public int Capacity { get; set; }

        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}