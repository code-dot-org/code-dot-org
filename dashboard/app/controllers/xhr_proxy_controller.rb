# A controller for proxying web requests to 3rd party APIs. This protects
# applab users from XSS attacks, complies with the Same Origin Policy,
# and prevents http/https mismatch warnings in IE.
#
# Responses are cached for one minute since many 3rd party APIs serve data
# which changes frequently such as news or sports scores.
#
# To reduce the likelihood of abuse, we only proxy content with an allowed
# list of JSON response types. We will need to monitor usage to detect
# abuse and potentially add other abuse prevention measures.

require 'set'
require 'cdo/shared_constants'

class XhrProxyController < ApplicationController
  include ProxyHelper

  ALLOWED_CONTENT_TYPES = Set.new(
    %w(
      application/json
      text/javascript
      text/json
      text/plain
    )
  ).freeze

  # 'code.org' is included so applab apps can access the tables and properties of other applab apps.
  ALLOWED_HOSTNAME_SUFFIXES = %w(
    allrecipes.com
    apex.oracle.com
    api.data.gov
    api.datamuse.com
    api.energidataservice.dk
    api.exchangeratesapi.io
    api.football-data.org
    api.foursquare.com
    api.fungenerators.com
    api.nasa.gov
    api.open-notify.org
    api.openweathermap.org
    api.pegelalarm.at
    api.randomuser.me
    api.rebrandly.com
    api.spacexdata.com
    api.spotify.com
    api.themoviedb.org
    api.thingspeak.com
    api.uclassify.com
    api.zippopotam.us
    atlas.media.mit.edu
    bible-api.com
    code.org
    compete.hsctf.com
    covidtracking.com
    cryptonator.com
    data.austintexas.gov
    data.cityofchicago.org
    data.gv.at
    data.nasa.gov
    developer.accuweather.com
    developers.zomato.com
    donordrive.com
    dweet.io
    enclout.com
    githubusercontent.com
    hamlin.myschoolapp.com
    herokuapp.com
    hubblesite.org
    images-api.nasa.gov
    isenseproject.org
    lakeside-cs.org
    maps.googleapis.com
    opentdb.com
    pokeapi.co
    qrng.anu.edu.au
    quandl.com
    quizlet.com
    rejseplanen.dk
    maker.ifttt.com
    maps.googleapis.com
    noaa.gov
    numbersapi.com
    pastebin.com
    random.org
    restcountries.eu
    rhcloud.com
    runescape.com
    samples.openweathermap.org
    sheets.googleapis.com
    spreadsheets.google.com
    stats.minecraftservers.org
    swapi.co
    theunitedstates.io
    transitchicago.com
    translate.yandex.net
    vpic.nhtsa.dot.gov
    wikipedia.org
    words.bighugelabs.com
  ).freeze

  # How long the content is allowed to be cached
  EXPIRY_TIME = 1.minute.freeze

  # Return the proxied api at the URL specified in the 'u' parameter. The 'c' parameter
  # is an unforgeable token which identifies the app lab app which is generating the request,
  # and may be used to enforce a per-app rate-limit.
  def get
    channel_id = params[:c]
    url = params[:u]

    headers = {}
    ALLOWED_WEB_REQUEST_HEADERS.each do |header|
      headers[header] = request.headers[header]
    end
    headers.compact!

    begin
      owner_storage_id, _ = storage_decrypt_channel_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError => e
      render_error_response 403, "Invalid token: '#{channel_id}' for url: '#{url}' exception: #{e.message}"
      return
    end

    event_details = {
      channel_id: channel_id,
      owner_storage_id: owner_storage_id,
      url: url
    }
    NewRelic::Agent.record_custom_event("XhrProxyControllerRequest", event_details) if CDO.newrelic_logging
    Rails.logger.info "XhrProxyControllerRequest #{event_details}"

    render_proxied_url(
      url,
      allowed_content_types: ALLOWED_CONTENT_TYPES,
      allowed_hostname_suffixes: ALLOWED_HOSTNAME_SUFFIXES,
      expiry_time: EXPIRY_TIME,
      infer_content_type: false,
      headers: headers,
    )
  end
end
