# == Schema Information
#
# Table name: lti_user_identities
#
#  id                 :bigint           not null, primary key
#  subject            :string(255)      not null
#  lti_integration_id :bigint           not null
#  user_id            :integer          not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_lti_user_identities_on_lti_integration_id  (lti_integration_id)
#  index_lti_user_identities_on_subject             (subject)
#  index_lti_user_identities_on_user_id             (user_id)
#
class LtiUserIdentity < ApplicationRecord
  belongs_to :lti_integration
  belongs_to :user

  validates :subject, presence: true
end
