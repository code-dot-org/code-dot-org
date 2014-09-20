json.array!(@prizes) do |prize|
  json.extract! prize, :prize_provider_id, :code, :user_id
  json.url prize_url(prize, format: :json)
end
