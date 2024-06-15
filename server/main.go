package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	_ "github.com/lib/pq"
    	"github.com/caarlos0/env/v11"
)

type config struct {
    DB_URL string `env:"DB_URL" envDefault:"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"`
    WEBHOOK_URL string `env:"WEBHOOK_URL"`
}

func main() {
    cfg, err := env.ParseAs[config]()
    if err != nil {
        panic(err)
    }

    d := discord {
        url: cfg.WEBHOOK_URL,
    }

    db, err := sql.Open("postgres", cfg.DB_URL)
    if err != nil {
        d.panic(err)
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
            d.log(err.Error())
            return c.SendStatus(http.StatusNotFound)
        default:
            d.log(err.Error())
            return c.SendStatus(http.StatusInternalServerError)
        }

        d.log(c.Method() + " " + c.Path())

        return c.SendString(highlights)
    })

    app.Post("/v1/:uuid", func(c *fiber.Ctx) error {
        query := `INSERT INTO highlights (uuid, highlights) VALUES ($1, $2) ON CONFLICT (uuid) DO UPDATE SET highlights = EXCLUDED.highlights`

        _, err = db.Exec(query, c.Params("uuid"), c.Body())
        if err != nil {
            slog.Error(err.Error())
            return c.SendStatus(http.StatusInternalServerError)
        }

        d.log(c.Method() + " " + c.Path() + " " + string(c.Body()))

        return c.Send(c.Body())
    })

    slog.Info("Server started")
    app.Listen(":3000")
}
