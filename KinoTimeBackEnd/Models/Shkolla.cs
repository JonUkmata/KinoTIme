// ID ,EmriShkolles,qyteti
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace KinoTimeBackEnd.Models
{
    public class Shkolla
    {
      
        public int Id { get; set; }

        [Required]
        public required string EmriShkolles { get; set; }
        [Required]
        public required string Qyteti { get; set; }
        
        [JsonIgnore]
        public ICollection<Nxenesi> Nxenesit { get; set; } = new List<Nxenesi>();
    }
}
