package main

import (
	"fmt"
	"log"
	"mime"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/kardianos/service"
	"github.com/shchy/epub_server/book"
)

var logger service.Logger

type program struct {
	exit chan struct{}
}

func (p *program) Start(s service.Service) error {
	p.exit = make(chan struct{})
	go p.run()
	return nil
}
func (p *program) Stop(s service.Service) error {
	close(p.exit)
	return nil
}

func (p *program) run() {
	bookDir := os.Getenv("EPUBS")
	if bookDir == "" {
		bookDir = "./"
	}

	bookManager := book.NewBookManager()
	bookManager.Load(filepath.Join(bookDir, "books"))

	app := fiber.New()
	app.Get("/api/books", func(c *fiber.Ctx) error {
		seriesid := c.Query("seriesid")
		books, err := bookManager.GetBooks(seriesid)
		if err != nil {
			return err
		}
		return c.JSON(books)
	})
	app.Get("/api/book/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		pages, err := bookManager.GetBookPages(id)
		if err != nil {
			return err
		}
		bookInfo, err := bookManager.GetBook(id)
		if err != nil {
			return err
		}

		return c.JSON(struct {
			Head  *book.BookInfo `json:"head"`
			Pages []string       `json:"pages"`
		}{
			Head:  bookInfo,
			Pages: pages,
		})
	})
	app.Get("/api/book/:id/*", func(c *fiber.Ctx) error {
		id := c.Params("id")
		href := c.Params("*")
		item, err := bookManager.GetBookContent(id, href)
		if err != nil {
			return err
		}

		mime.ParseMediaType(item.Mime)
		c.Set("Content-type", item.Mime)
		return c.Send(item.Data)
	})

	app.Get("/api/series", func(c *fiber.Ctx) error {
		series, err := bookManager.GetSeries()
		if err != nil {
			return err
		}
		return c.JSON(series)
	})

	app.Static("/", filepath.Join(bookDir, "web"))
	app.Get("/*", func(c *fiber.Ctx) error {
		return c.SendFile(filepath.Join(bookDir, "web/index.html"))
	})
	err := app.Listen(":80")
	if err != nil {
		err = app.Listen(":8080")
		if err != nil {
			panic((err))
		}
	}
}

func main() {
	svcConfig := &service.Config{
		Name:        "EpubServer",
		DisplayName: "EpubServer",
		Description: "EpubServer Go service.",
	}

	prg := &program{}
	s, err := service.New(prg, svcConfig)
	if err != nil {
		log.Fatal(err)
	}
	logger, err = s.Logger(nil)
	if err != nil {
		log.Fatal(err)
	}

	if len(os.Args) > 1 {

		err = service.Control(s, os.Args[1])
		if err != nil {
			fmt.Printf("Failed (%s) : %s\n", os.Args[1], err)
			return
		}
		fmt.Printf("Succeeded (%s)\n", os.Args[1])
		return
	}

	err = s.Run()
	if err != nil {
		logger.Error(err)
	}

}
