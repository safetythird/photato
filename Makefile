IMGTAG=photato
CONTAINERNAME=photato

all: build run

.PHONY: build
build:
	docker build -t $(IMGTAG) .

.PHONY: run
run:
	docker run --rm -it -v $(PWD):/app -v /var/photato/sqlite:/sqlite -v /var/photato/media:/media -p 80:8000 --env FLICKR_API_KEY --env FLICKR_API_SECRET --name $(CONTAINERNAME) $(IMGTAG)

.PHONY: lint
lint:
	docker run --rm -it -v $(PWD):/app --name $(CONTAINERNAME)_lint $(IMGTAG) eslint -f compact '**/*.js'

.PHONY: test
test: lint
	echo "add some damn tests!"
