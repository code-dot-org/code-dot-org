# == Schema Information
#
# Table name: ai_tutor_interaction_feedbacks
#
#  id                      :bigint           not null, primary key
#  ai_tutor_interaction_id :bigint           not null
#  user_id                 :integer          not null
#  thumbs_up               :boolean
#  thumbs_down             :boolean
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  details                 :text(65535)
#
# Indexes
#
#  fk_rails_105c1f9428                              (user_id)
#  index_ai_tutor_feedback_on_interaction_and_user  (ai_tutor_interaction_id,user_id) UNIQUE
#
class AiTutorInteractionFeedback < ApplicationRecord
  belongs_to :ai_tutor_interaction
  belongs_to :user
end
