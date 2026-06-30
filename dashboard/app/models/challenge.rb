# == Schema Information
#
# Table name: challenges
#
#  id                                :bigint           not null, primary key
#  lesson_id                         :integer          not null
#  question                          :text(65535)      not null
#  default_modality                  :string(255)
#  whiteboard_starter_image_alt_text :text(65535)
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#
# Indexes
#
#  index_challenges_on_lesson_id  (lesson_id)
#
class Challenge < ApplicationRecord
  belongs_to :lesson
  has_many :challenge_responses, dependent: :destroy

  # whiteboard / video. Null = no default modality for this challenge.
  enum default_modality: {
    whiteboard: 'whiteboard',
    video: 'video',
  }, _prefix: :default

  validates :question, presence: true
end
