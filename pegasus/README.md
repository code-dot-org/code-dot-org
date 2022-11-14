# The Pegasus Directory

The **Pegasus Directory** contains the server-side code for [the **Code.org** website](https://code.org/), a [Sinatra](http://www.sinatrarb.com/) application responsible for:
* [code.org](https://code.org)
* [hourofcode.com](https://hourofcode.com)
* [csedweek.org](https://csedweek.org)

### Hour of Code site

The Hour of Code site can be accessed locally at http://localhost.hourofcode.com:3000. Some pages (ex. the Hour of Code signup form) will not work locally unless you point your local config at the production Mapbox instance. To do this, go to the AWS Secrets Manager and copy the value for `*/cdo/mapbox_access_token` (the token should be the same across environments). Add the `mapbox_access_token` to your `locals.yml`. This should allow you to view the local form with production data. **Note:** Do not set `mapbox_upload_token` locally.

