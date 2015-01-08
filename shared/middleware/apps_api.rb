require 'sinatra/base'

class AppsApi < Sinatra::Base

  configure do
  end

  before do
  end

  after do
  end

  helpers do
  end

  get '/v3/apps/hello/*' do |what|
    content_type :json
    JSON.pretty_generate({hello:what})
  end

end
