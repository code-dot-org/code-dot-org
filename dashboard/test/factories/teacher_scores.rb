# == Schema Information
#
# Table name: teacher_scores
#
#  id            :integer          not null, primary key
#  user_level_id :integer          unsigned
#  teacher_id    :integer
#  score         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_teacher_scores_on_user_level_id  (user_level_id)
#

FactoryGirl.define do
  factory :teacher_score do
    user_level_id 1
    teacher_id 1
    score 1
    created_at "2020-02-20 12:37:00"
  end
end
