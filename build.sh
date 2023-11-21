# !/bin/bash

rm -rf release
mkdir -p release/books
touch release/books/.keep


cd ./client
npm run build
cp -r ./dist ../release/web

cd ../server
GOOS=windows GOARCH=amd64 go build -o ../release/epub.exe main.go 