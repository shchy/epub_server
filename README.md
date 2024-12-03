# 手順

## ローカルPC

### 1. epubの配置
任意のディレクトリにepubファイル群を配置

### 2. index.jsonとサムネイルの生成
`pnpm indexing <epub配置フォルダ>`  
`pnpm indexing mount`  

### 3. サーバにコピー
`rsync -r -v --progress --size-only ssh ./mount/books/ pi@raspberrypi.local:/home/pi/src/books`
`rsync -r -v --progress --size-only ssh ./mount/thumbnail/ pi@raspberrypi.local:/home/pi/src/thumbnail`

`ping -4 raspberrypi.local`

## サーバ(Raspberrypi)

### 1. 最新ソース取得(コード修正がない場合は不要)
`git pull`

### 2. dockerイメージ更新(コード修正がない場合は不要)
raspberryzero2くらいだとスペック低すぎるのか失敗するけどキャッシュ使って少しずつ進めれば通る
```sh
# docker build . -t epub --platform linux/arm/v7
docker build . -t epub
```

### 3. epub配置フォルダでdocker起動

```sh
docker run \
  -p 443:443 \
  -v $(pwd)/books:/serve/public/books \
  -v $(pwd)/thumbnail:/serve/public/thumbnail \
  -v $(pwd)/cert:/serve/cert \
  -d \
  epub
```

# ローカル動作確認

## 1. dockerイメージ更新
`docker build . -t epub`

## 2. docker起動
```sh
docker run \
  -p 8443:443 \
  -v $(pwd)/mount/books:/serve/public/books \
  -v $(pwd)/mount/thumbnail:/serve/public/thumbnail \
  -v $(pwd)/mount/cert:/serve/cert \
  -it epub \
  ash
```

# 証明書について
mkcertでローカルPCにルート証明書作成  
mkcertでサーバ（RaspberryPI）のIPで証明書作成  
ルート証明書を家族のiPhoneにAirDropで転送してインストールしてもらう

