FROM node:lts-alpine3.20 AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /build
COPY ./ /build
RUN mkdir /build/dist
RUN COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm i \
  && pnpm build \
  && pnpm --filter @epub/server deploy --prod /build/dist/server \
  && mv /build/packages/client/dist /build/dist/client


FROM node:lts-alpine3.20 AS runtime
ENV publicDir=/serve/public
ENV epubFileDir=/serve/public/books
ENV indexFilePath=/serve/public/books/index.json
ENV certfile=/serve/cert/cert.pem
ENV keyfile=/serve/cert/key.pem
ENV listenport=443
ENV NODE_PATH="/serve/node_modules;$NODE_PATH"

WORKDIR /serve
COPY --from=builder /build/dist/server/dist /serve/bin
COPY --from=builder /build/dist/server/node_modules /serve/node_modules
COPY --from=builder /build/dist/client /serve/public
CMD ["node","bin"]

# docker build . -t epub
# docker run \
#   -p 443:443 \
#   -v $(pwd)/mount/books:/serve/public/books \
#   -v $(pwd)/mount/thumbnail:/serve/public/thumbnail \
#   -v $(pwd)/mount/cert:/serve/cert \
#   epub


# docker run \
#   -p 8443:443 \
#   -v $(pwd)/mount/books:/serve/public/books \
#   -v $(pwd)/mount/thumbnail:/serve/public/thumbnail \
#   -v $(pwd)/mount/cert/cert.pem:/serve/cert/cert.pem \
#   -v $(pwd)/mount/cert/key.pem:/serve/cert/key.pem \
#   -it test ash

