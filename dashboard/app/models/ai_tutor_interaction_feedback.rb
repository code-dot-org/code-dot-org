# TODO: Figure out how to add annotations here
class AiTutorInteractionFeedback < ApplicationRecord
  belongs_to :ai_tutor_interaction
  belongs_to :user

  validates :thumbs_up, inclusion: {in: [true, false]}, allow_nil: true
  validates :thumbs_down, inclusion: {in: [true, false]}, allow_nil: true
end
