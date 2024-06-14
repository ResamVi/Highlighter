FROM golang:1.22.4

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./

RUN go build -o highlighter-server

CMD ["./highlighter-server"]
