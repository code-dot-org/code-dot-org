json.array!(@prize_providers) do |prize_provider|
  json.extract! prize_provider, :name, :url, :description_token, :image_name
  json.url prize_provider_url(prize_provider, format: :json)
end
