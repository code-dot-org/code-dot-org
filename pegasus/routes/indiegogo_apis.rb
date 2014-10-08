get '/v2/indiegogo_campaigns' do
  uri = URI('https://api.indiegogo.com/1/campaigns/964232.json?api_token=' + CDO.indiegogo_api_token)
  Net::HTTP.get(uri) # => String
end

get '/v2/indiegogo_contributions' do
  uri = URI('https://api.indiegogo.com/1/campaigns/964232/contributions.json?api_token=' + CDO.indiegogo_api_token)
  Net::HTTP.get(uri) # => String
end