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
      application/geo+json
      text/javascript
      text/json
      text/plain
    )
  ).freeze

  # 'code.org' is included so applab apps can access the tables and properties of other applab apps.
  ALLOWED_HOSTNAME_SUFFIXES = %w(
    api.amadeus.com
    api.arasaac.org
    api.blizzard.com
    api.census.gov
    api.coinlayer.com
    api.datamuse.com
    api.duckduckgo.com
    api.energidataservice.dk
    api.exchangeratesapi.io
    api.fda.gov
    api.football-data.org
    api.foursquare.com
    api.github.com
    api.mathjs.org
    api.mojang.com
    api.nal.usda.gov
    api.nasa.gov
    api.nookipedia.com
    api.opencagedata.com
    api.open-notify.org
    api.open-meteo.com
    api.openrouteservice.org
    api.openweathermap.org
    api.pegelalarm.at
    api.quotable.io
    api.randomuser.me
    api.rebrandly.com
    api.scryfall.com
    api.spoonacular.com
    api.si.edu
    api.spacexdata.com
    api.spotify.com
    api.themoviedb.org
    api.thingspeak.com
    api.uclassify.com
    api.waqi.info
    api.weather.gov
    api.weatherapi.com
    api.wolframalpha.com
    api.zippopotam.us
    bible-api.com
    bnefoodtrucks.com.au
    ch.tetr.io
    code.org
    covidtracking.com
    cryptonator.com
    currencyapi.com
    data.austintexas.gov
    data.cityofchicago.org
    data.gv.at
    data.nasa.gov
    data.weather.gov.hk
    dataservice.accuweather.com
    deckofcardsapi.com
    distanza.org
    dweet.io
    githubusercontent.com
    googleapis.com
    grobchess.com
    hubblesite.org
    images-api.nasa.gov
    itunes.apple.com
    io.adafruit.com
    isenseproject.org
    lakeside-cs.org
    maker.ifttt.com
    myschoolapp.com
    native-land.ca
    newsapi.org
    noaa.gov
    numbersapi.com
    open.mapquestapi.com
    opentdb.com
    pixabay.com
    pokeapi.co
    pro-api.coinmarketcap.com
    qrng.anu.edu.au
    quandl.com
    random.org
    rejseplanen.dk
    restcountries.eu
    roblox.com
    runescape.com
    sessionserver.mojang.com
    stats.minecraftservers.org
    swapi.dev
    textures.minecraft.net
    thecatapi.com
    thedogapi.com
    theunitedstates.io
    transitchicago.com
    vpic.nhtsa.dot.gov
    wikipedia.org
    worldclockapi.com
    worldtimeapi.org
    xeno-canto.org
  ).freeze

  # How long the content is allowed to be cached
  EXPIRY_TIME = 1.minute.freeze

  # Return the proxied api at the URL specified in the 'u' parameter. The 'c' parameter
  # is an unforgeable token which identifies the app lab app which is generating the request,
  # and may be used to enforce a per-app rate-limit.
  def get
    channel_id = params[:c]
    url = params[:u]

    begin
      owner_storage_id, _ = storage_decrypt_channel_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError => exception
      render_error_response 403, "Invalid token: '#{channel_id}' for url: '#{url}' exception: #{exception.message}"
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
    )
  end
end
