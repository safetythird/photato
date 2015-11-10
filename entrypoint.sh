#! /bin/sh

set -e

if [ -n "$1" ]; then
  $@
else
  mkdir -p static/js
  (cd public; watchify --poll -d -o /app/static/js/bundle.js -t stringify app.js &)
  python manage.py runserver 0.0.0.0:8000
fi