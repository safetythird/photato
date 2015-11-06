IMGTAG=photato
CONTAINERNAME=photato

all: build run

.PHONY: build
build:
	docker build -t $(IMGTAG) .

.PHONY: run
run:
	docker run --rm -it -v $(PWD):/app -p 80:8080 --name $(CONTAINERNAME) $(IMGTAG)

.PHONY: lint
lint:
	docker run --rm -it -v $(PWD):/app --name $(CONTAINERNAME)_lint $(IMGTAG) eslint -f compact '**/*.js'

.PHONY: test
test: lint
	echo "add some damn tests!"
