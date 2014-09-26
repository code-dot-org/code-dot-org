We use Dropbox shares to allow various contributors to make modifications on our staging server.

# Adding a new Dropbox share on staging

1. `ssh staging.code.org`
1. `cd Dropbox/shared`
1. `ln -s /home/ubuntu/staging/PATH_TO_STAGING_FOLDER .`

Now you can log on to the staging Dropbox account and share with your desired contributors.
