# == Schema Information
#
# Table name: new_feature_feedbacks
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  form_key   :integer          not null
#  satisfied  :boolean          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_new_feature_feedbacks_on_satisfied             (satisfied)
#  index_new_feature_feedbacks_on_user_id               (user_id)
#  index_new_feature_feedbacks_on_user_id_and_form_key  (user_id,form_key) UNIQUE
#
class NewFeatureFeedback < ApplicationRecord
  belongs_to :user

  validates :satisfied, inclusion: {in: [true, false]}

  enum :form_key, {
    progress_v2: 0
  }
end
