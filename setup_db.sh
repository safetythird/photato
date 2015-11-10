#! /bin/bash

set -e

containerid=$(docker ps -q -f "name=photato")

docker exec $containerid python manage.py migrate
docker exec -it $containerid python manage.py createsuperuser