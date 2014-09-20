get '/v2/client-location' do
  dont_cache

  location = request.location
  location = {
    ip_address:request.ip,
    city:location.city,
    state:location.state,
    state_code:location.state_code,
    country:location.country,
    country_code:location.country_code,
    zip_code:location.postal_code,
    postal_code:location.postal_code,
  }

  content_type :json
  JSON.pretty_generate(location)
end
