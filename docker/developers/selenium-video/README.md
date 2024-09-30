# Selenium-Video Custom Container

We maintain this very simple augmentation of the `selenium-video` container image
that allows us to remotely start and stop the video recording.

The `Dockerfile` here in this directory is fairly self-explanatory... it mainly
adds the `control.py` file to the container (here, it is `selenium-video.control.py`.)

See the `docker-compose.selenium.yml` file in the parent directory to see how the
container is used and referenced. And, also, the `record-*` container services
described in `docker-compose.testing.yml`.
