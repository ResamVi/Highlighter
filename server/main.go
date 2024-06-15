package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/caarlos0/env/v11"
	_ "github.com/lib/pq"
)

type config struct {
    DB_URL string `env:"DB_URL" envDefault:"postgresql://postgres:postgres@localhost:5433/postgres?sslmode=disable"`
    WEBHOOK_URL string `env:"WEBHOOK_URL"`
}

type server struct {
    db *sql.DB
    discord discord
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

    for {
        err := db.Ping()
        if err != nil {
            slog.Info("Could not connect to " + cfg.DB_URL)
            time.Sleep(3 * time.Second)
            continue
        }
        break
    }

    srv := server {
        db: db,
        discord: d,
    }

    app := fiber.New()
    app.Use(logger.New())
    app.Get("/health", srv.Health)
    app.Get("/v1/:uuid", srv.Get)
    app.Post("/v1/:uuid", srv.Post)

    slog.Info("Server started")
    app.Listen(":3377")
}

func (s server) Health(c *fiber.Ctx) error {
    return c.SendString("healthy")
}

func (s server) Get(c *fiber.Ctx) error {
    row := s.db.QueryRow("SELECT uuid, highlights FROM highlights WHERE uuid = $1", c.Params("uuid"))

    var uuid, highlights string
    switch err := row.Scan(&uuid, &highlights); err {
    case nil:
        break
    case sql.ErrNoRows:
        return c.JSON(fiber.Map{})
    default:
        s.discord.log(err.Error())
        return c.SendStatus(http.StatusInternalServerError)
    }

    c.Response().Header.Set("Content-Type", "application/json")
    return c.SendString(highlights)
}

func (s server) Post(c *fiber.Ctx) error {
    query := `INSERT INTO highlights (uuid, highlights) VALUES ($1, $2) ON CONFLICT (uuid) DO UPDATE SET highlights = EXCLUDED.highlights`

    _, err := s.db.Exec(query, c.Params("uuid"), c.Body())
    if err != nil {
        slog.Error(err.Error())
        return c.SendStatus(http.StatusInternalServerError)
    }

    return c.Send(c.Body())
}
