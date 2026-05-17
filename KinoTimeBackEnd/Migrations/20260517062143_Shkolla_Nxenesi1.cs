using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KinoTimeBackEnd.Migrations
{
    /// <inheritdoc />
    public partial class Shkolla_Nxenesi1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Klasa",
                table: "Nxenesit",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Klasa",
                table: "Nxenesit",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
