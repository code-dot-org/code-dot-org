# All code.org/pd/XXXX routes are redirected to the equivalent studio.code.org/pd/attend/XXXX
get '/pd/:session_code' do |session_code|
  attend_url = CDO.studio_url "pd/attend/#{session_code}", CDO.default_scheme
  redirect attend_url, 302
end
