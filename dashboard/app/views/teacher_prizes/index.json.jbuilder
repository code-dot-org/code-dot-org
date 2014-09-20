json.array!(@teacher_prizes) do |teacher_prize|
  json.extract! teacher_prize, :prize_provider_id, :code, :user_id
  json.url teacher_prize_url(teacher_prize, format: :json)
end
