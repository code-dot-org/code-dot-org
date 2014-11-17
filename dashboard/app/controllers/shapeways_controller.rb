class ShapewaysController < ApplicationController
  CONSUMER_KEY = CDO.dashboard_shapeways_consumer_key
  CONSUMER_SECRET = CDO.dashboard_shapeways_consumer_secret
  OAUTH_TOKEN = CDO.dashboard_shapeways_oauth_token
  OAUTH_SECRET = CDO.dashboard_shapeways_oauth_secret

  OAUTH_DEBUG = false

  # Upload to Shapeways, return JSON with URL
  def upload
    stl_data = params[:stl_data]

    consumer = OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET,
      :site => 'http://api.shapeways.com',
      :request_token_path => '/oauth1/request_token/v1',
      :authorize_path => '/oauth1/authorize/v1',
      :access_token_path => '/oauth1/access_token/v1'
    )
    consumer.http.set_debug_output($stderr) if OAUTH_DEBUG
    access = OAuth::AccessToken.new(consumer, OAUTH_TOKEN, OAUTH_SECRET)

    query_data = {
        :fileName => 'my_artist_drawing.stl',
        :file => Base64.encode64(stl_data),
        :isPublic => true,
        :isForSale => 1,
        :viewState => 1,
        :isDownloadable => 1,
        :hasRightsToModel => true,
        :acceptTermsAndConditions => true
    }

    result = access.post('/models/v1', query_data.to_json,
                         {'Content-Type' => 'application/json; charset=utf-8',
                          'Accept'=>'application/json' })

    result_object = JSON.parse(result.body)
    public_model_url = result_object['urls']['publicProductUrl']['address']

    if OAUTH_DEBUG
      puts result.body
      puts result.code
      puts result_object
      puts "New shapeways model URL: #{public_model_url}"
    end

    render json: {public_model_url: public_model_url}
  end
end
