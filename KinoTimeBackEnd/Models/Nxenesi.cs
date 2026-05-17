// ID ,EmriNxenesit,Klasa,ShkollaID
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KinoTimeBackEnd.Models
{
    public class Nxenesi
    {
        public int Id { get; set; }

        [Required]
        public int ShkollaId { get; set; }

        [ForeignKey("ShkollaId")]
        public Shkolla? Shkolla { get; set; }

        [Required]
        public required string EmriNxenesit { get; set; }
        
        [Required]
        public required int Klasa { get; set; }
    }
}

