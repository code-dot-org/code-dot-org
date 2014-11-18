get '/v2/indiegogo_campaigns' do
  cache_control :public, :must_revalidate, max_age:60
  uri = URI('https://api.indiegogo.com/1/campaigns/964232.json?api_token=' + CDO.indiegogo_api_token)
  Net::HTTP.get(uri)
end

get '/v2/indiegogo_contributions' do
  cache_control :public, :must_revalidate, max_age:60
  uri = URI('https://api.indiegogo.com/1/campaigns/964232/contributions.json?api_token=' + CDO.indiegogo_api_token)
  Net::HTTP.get(uri)
end
