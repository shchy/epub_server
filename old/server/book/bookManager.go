package book

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	. "github.com/samber/lo"
)

type BookManagerImpl struct {
	books  []Book
	series []*SeriesInfo
}

func NewBookManager() BookManager {
	return &BookManagerImpl{
		books:  []Book{},
		series: []*SeriesInfo{},
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

func (i *BookManagerImpl) GetBooks(seriesId string) ([]*BookInfo, error) {
	seriesList, err := i.GetSeries()
	if err != nil {
		return nil, err
	}

	series, isFind := Find(seriesList, func(series *SeriesInfo) bool {
		return series.Id == seriesId
	})
	if !isFind {
		return nil, fmt.Errorf("series not found id=" + seriesId)
	}

	return series.Infos, nil
}

func (i *BookManagerImpl) GetBook(id string) (*BookInfo, error) {

	findOne, isFind := Find(i.books, func(item Book) bool {
		return item.GetId() == id
	})
	if !isFind {
		return nil, fmt.Errorf("not found book id=%s", id)
	}

	return &BookInfo{
		Id:    findOne.GetId(),
		Title: findOne.GetTitle(),
	}, nil
}

func (i *BookManagerImpl) GetBookPages(id string) ([]string, error) {
	book, isFind := Find(i.books, func(item Book) bool {
		return item.GetId() == id
	})
	if !isFind {
		return nil, fmt.Errorf("not found book id=%s", id)
	}

	pages, err := book.GetPages()
	if err != nil {
		return nil, err
	}

	return pages, nil

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

func (i *BookManagerImpl) GetSeries() ([]*SeriesInfo, error) {
	if len(i.series) == 0 {
		books := i.books

		// idがある程度一致しているものを同シリーズとみなす
		seriesList := make([]*SeriesInfo, 0)

		for _, book := range books {
			info := &BookInfo{
				Id:    book.GetId(),
				Title: book.GetTitle(),
			}
			idParts := strings.Split(info.Id, "_")
			dataId := idParts[0]

			series, isFind := Find(seriesList, func(item *SeriesInfo) bool {
				return item.Id == dataId
			})
			if !isFind {
				series = &SeriesInfo{
					Id:    dataId,
					Title: info.Title,
					Infos: []*BookInfo{},
				}
				seriesList = append(seriesList, series)
			}
			series.Infos = append(series.Infos, info)
		}
		i.series = seriesList
	}

	return i.series, nil
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
