using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KinoTimeBackEnd.Migrations
{
    /// <inheritdoc />
    public partial class Shkolla_Nxenesi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Shkollat",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmriShkolles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Qyteti = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shkollat", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Nxenesit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShkollaId = table.Column<int>(type: "int", nullable: false),
                    EmriNxenesit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Klasa = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nxenesit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nxenesit_Shkollat_ShkollaId",
                        column: x => x.ShkollaId,
                        principalTable: "Shkollat",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Nxenesit_ShkollaId",
                table: "Nxenesit",
                column: "ShkollaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nxenesit");

            migrationBuilder.DropTable(
                name: "Shkollat");
        }
    }
}
