package main

import (
	"fmt"
	"mime"

	"github.com/gofiber/fiber/v2"
	"github.com/shchy/epub_server/book"
)

func main() {

	bookManager := book.NewBookManager()
	bookManager.Load("./local")
	epubs, err := bookManager.GetBooks()
	if err != nil {
		panic(err)
	}
	fmt.Println(len(epubs))

	app := fiber.New()
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World 👋!")
	})

	app.Get("/api/books", func(c *fiber.Ctx) error {
		books, err := bookManager.GetBooks()
		if err != nil {
			return err
		}
		return c.JSON(books)
	})
	app.Get("/book/:id/:page", func(c *fiber.Ctx) error {
		id := c.Params("id")
		index, err := c.ParamsInt("page")
		if err != nil {
			return err
		}

		item, err := bookManager.GetBookPage(id, index)
		if err != nil {
			return err
		}

		return c.Redirect(fmt.Sprintf("%s/%s", c.Path(), item.Href))
	})
	app.Get("/book/:id/:page/*", func(c *fiber.Ctx) error {
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
	app.Listen(":3000")
}
