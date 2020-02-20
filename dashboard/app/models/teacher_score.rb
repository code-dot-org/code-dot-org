# == Schema Information
#
# Table name: teacher_scores
#
#  id            :integer          not null, primary key
#  user_level_id :integer
#  teacher_id    :integer
#  score         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_teacher_scores_on_created_at     (created_at)
#  index_teacher_scores_on_teacher_id     (teacher_id)
#  index_teacher_scores_on_user_level_id  (user_level_id)
#

class TeacherScore < ApplicationRecord
end
