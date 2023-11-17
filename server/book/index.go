package book

import (
	"io"

	"github.com/shchy/epub_server/epub"
)

type Book interface {
	Open() error
	Close()
	IsOpen() bool
	GetId() string
	GetTitle() string
	GetPages() ([]string, error)
	GetContent(href string) (*BookItem, error)
}

type BookManager interface {
	Load(dirPath string) error
	GetBooks() ([]*BookInfo, error)
	GetBook(id string) (*BookInfo, error)
	GetBookPages(id string) ([]string, error)
	GetBookContent(id string, href string) (*BookItem, error)
}

type BookInfo struct {
	Id    string `json:"id"`
	Title string `json:"title"`
}

type BookItem struct {
	Href string `json:"href"`
	Mime string `json:"mime"`
	Data []byte `json:"data"`
}

func ReadBytes(item epub.Item) ([]byte, error) {
	r, err := item.Open()
	if err != nil {
		return nil, err
	}
	bytes, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	return bytes, nil
}

func ToPage(item epub.Item) (*BookItem, error) {
	bytes, err := ReadBytes(item)
	if err != nil {
		return nil, err
	}
	page := &BookItem{
		Href: item.HREF,
		Mime: item.MediaType,
		Data: bytes,
	}
	return page, nil
}
