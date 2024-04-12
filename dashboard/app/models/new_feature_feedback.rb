# == Schema Information
#
# Table name: new_feature_feedbacks
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  form_key   :string(255)      not null
#  satisfied  :boolean          not null
#  locale     :string(255)
#  created_at :datetime         not null
#
# Indexes
#
#  index_new_feature_feedbacks_on_satisfied  (satisfied)
#  index_new_feature_feedbacks_on_user_id    (user_id) UNIQUE
#
# A simple thumbs up/down feedback form.
# Intended for use by a front-end banner for new feature feedback.
class NewFeatureFeedback < ApplicationRecord
  belongs_to :user

  validates :user_id, uniqueness: true
  validates :satisfied, inclusion: {in: [true, false]}
  validates :form_key, presence: true, allow_blank: false, inclusion: {in: %w[progress_v2]}
  validates :locale, inclusion: {in: I18n.available_locales.map(&:to_s)}, allow_nil: true
end
