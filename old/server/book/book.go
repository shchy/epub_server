package book

import (
	"fmt"

	. "github.com/samber/lo"
	"github.com/shchy/epub_server/epub"
	// "github.com/taylorskalyo/goreader/epub"
)

type BookImpl struct {
	filePath string
	book     *epub.Rootfile
	rc       *epub.ReadCloser
}

func NewBook(filePath string) Book {
	return &BookImpl{
		filePath: filePath,
	}
}

func (i *BookImpl) Open() error {
	rc, err := epub.OpenReader(i.filePath)
	if err != nil {
		return err
	}
	book := rc.Rootfiles[0]
	i.book = book
	i.rc = rc
	return nil
}

func (i *BookImpl) Close() {
	i.rc.Close()
	i.book = nil
	i.rc = nil
}

func (i *BookImpl) IsOpen() bool {
	return i.rc != nil

}

func (i *BookImpl) GetId() string {
	return i.book.Identifier
}

func (i *BookImpl) GetTitle() string {
	return i.book.Title
}

func (i *BookImpl) GetPages() ([]string, error) {
	hrefs := Map(i.book.Spine.Itemrefs, func(ref epub.Itemref, _ int) string {
		return ref.HREF
	})
	return hrefs, nil
}

func (i *BookImpl) GetContent(href string) (*BookItem, error) {

	findOne, isFind := Find(i.book.Items, func(ref epub.Item) bool {
		return ref.HREF == href
	})

	if !isFind {
		return nil, fmt.Errorf("content not found")
	}

	return ToPage(findOne)
}
