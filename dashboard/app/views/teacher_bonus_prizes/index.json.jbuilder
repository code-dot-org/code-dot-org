json.array!(@teacher_bonus_prizes) do |teacher_bonus_prize|
  json.extract! teacher_bonus_prize, :prize_provider_id, :code, :user_id
  json.url teacher_bonus_prize_url(teacher_bonus_prize, format: :json)
end
