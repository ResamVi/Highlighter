package main

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	_ "github.com/lib/pq"
)

func main() {
    connStr := "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        slog.Error(err.Error())
        panic(err)
    }

    app := fiber.New()
    app.Use(logger.New())

    app.Get("/v1/:uuid", func(c *fiber.Ctx) error {
        row := db.QueryRow("SELECT uuid, highlights FROM highlights WHERE uuid = $1", c.Params("uuid"))

        var uuid, highlights string
        switch err := row.Scan(&uuid, &highlights); err {
        case nil:
            break
        case sql.ErrNoRows:
            slog.Info("No rows were returned!")
            return c.SendStatus(http.StatusNotFound)
        default:
            slog.Error(err.Error())
            return c.SendStatus(http.StatusInternalServerError)
        }

        return c.SendString(highlights)
    })
    app.Post("/v1/:uuid", func(c *fiber.Ctx) error {
        return c.SendString("Hello, World!")
    })

    slog.Info("Server started")
    app.Listen(":3000")
}
