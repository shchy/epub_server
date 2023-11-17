package book

import (
	"github.com/samber/lo"
)

type CacheItem[T any] struct {
	Key   string
	Value T
}

type Cache[T any] struct {
	size int
	data []CacheItem[T]
}

func NewCache[T any](size int) *Cache[T] {
	return &Cache[T]{
		size: size,
		data: []CacheItem[T]{},
	}
}

func (i *Cache[T]) Add(key string, data T) {
	i.data = lo.Filter(i.data, func(item CacheItem[T], _ int) bool {
		return item.Key != key
	})

	cacheItem := CacheItem[T]{
		Key:   key,
		Value: data,
	}
	i.data = append(i.data, cacheItem)

	for i.size < len(i.data) {
		i.data = i.data[1:]
	}
}

func (i *Cache[T]) Get(key string) *T {

	findOne, isFind := lo.Find(i.data, func(item CacheItem[T]) bool {
		return item.Key == key
	})
	if !isFind {
		return nil
	}
	return &findOne.Value
}
