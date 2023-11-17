package book

import (
	"fmt"
	"os"
	"path/filepath"

	. "github.com/samber/lo"
)

type BookManagerImpl struct {
	books []Book
}

func NewBookManager() BookManager {
	return &BookManagerImpl{
		books: []Book{},
	}
}

func (i *BookManagerImpl) Load(dirPath string) error {

	for _, book := range i.books {
		book.Close()
	}
	i.books = []Book{}

	files, err := findFiles(dirPath, func(fileName string) bool {
		ext := filepath.Ext(fileName)
		return ext == ".epub"
	})
	if err != nil {
		return err
	}

	books := Map(files, func(path string, _ int) Book {
		book := NewBook(path)
		err := book.Open()
		if err != nil {
			fmt.Printf("load epub error: %v", err)
			return nil
		}
		return book
	})
	i.books = books
	return nil
}

func (i *BookManagerImpl) GetBooks() ([]*BookFace, error) {

	faces := Map(i.books, func(book Book, _ int) *BookFace {
		bookId := book.GetId()
		bookTitle := book.GetTitle()
		pageCount := book.GetPageCount()
		firstPage, err := book.GetPage(0)
		if err != nil {
			fmt.Printf("load epub error: %v", err)
			return nil
		}

		return &BookFace{
			Id:        bookId,
			Title:     bookTitle,
			PageCount: pageCount,
			Face:      firstPage,
		}
	})

	return faces, nil
}

func (i *BookManagerImpl) GetBookPage(id string, index int) (*BookItem, error) {
	book, isFind := Find(i.books, func(item Book) bool {
		return item.GetId() == id
	})
	if !isFind {
		return nil, fmt.Errorf("not found book id=%s", id)
	}

	page, err := book.GetPage(index)
	if err != nil {
		return nil, err
	}

	return page, nil

}
func (i *BookManagerImpl) GetBookContent(id string, href string) (*BookItem, error) {
	book, isFind := Find(i.books, func(item Book) bool {
		return item.GetId() == id
	})
	if !isFind {
		return nil, fmt.Errorf("not found book id=%s", id)
	}

	page, err := book.GetContent(href)
	if err != nil {
		return nil, err
	}

	return page, nil
}

func findFiles(dirPath string, predicate func(filename string) bool) ([]string, error) {
	xs, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	files := []string{}
	for _, entry := range xs {
		info, err := entry.Info()
		if err != nil {
			continue
		}
		path := filepath.Join(dirPath, info.Name())
		if info.IsDir() {
			subFiles, err := findFiles(path, predicate)
			if err != nil {
				continue
			}
			files = append(files, subFiles...)
		} else if predicate(info.Name()) {
			files = append(files, path)
		}
	}

	return files, nil
}
