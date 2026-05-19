# == Schema Information
#
# Table name: ai_student_podcasts
#
#  id             :bigint           not null, primary key
#  user_id        :bigint
#  lesson_id      :integer
#  podcast_script :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class AiStudentPodcast < ApplicationRecord
  has_many :ai_student_podcast_objectives, dependent: :destroy
  has_many :objectives, through: :ai_student_podcast_objectives
end
