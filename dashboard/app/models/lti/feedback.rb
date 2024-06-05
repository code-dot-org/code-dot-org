# == Schema Information
#
# Table name: lti_feedbacks
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  satisfied    :boolean          not null
#  locale       :string(255)
#  early_access :boolean
#  created_at   :datetime         not null
#
# Indexes
#
#  index_lti_feedbacks_on_satisfied  (satisfied)
#  index_lti_feedbacks_on_user_id    (user_id) UNIQUE
#
module Lti
  class Feedback < ApplicationRecord
    belongs_to :user

    validates :user_id, uniqueness: true
    validates :satisfied, inclusion: {in: [true, false]}
    validates :locale, inclusion: {in: I18n.available_locales.map(&:to_s)}, allow_nil: true
  end
end
