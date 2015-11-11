# photato

Search and upload photos from the Flickr API.

## Local Development

You will need a Flickr API key and secret in the environment variables `FLICKR_API_KEY` and `FLICKR_API_SECRET`.

`make` will build and run the Docker container for the application. Once it's operational, run `./setup_db.sh` to run initial migrations and create a user.

Point your browser to the address of your Docker VM to view the page. You will need to login as the user you just created in order to save images.