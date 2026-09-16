# == Schema Information
#
# Table name: sign_ins
#
#  id                       :integer          not null, primary key
#  user_id                  :integer          not null
#  sign_in_at               :datetime         not null
#  sign_in_count            :integer          not null
#  anon_user_id             :string(36)
#  authentication_option_id :integer
#  event_type               :string(32)
#
# Indexes
#
#  index_sign_ins_on_sign_in_at  (sign_in_at)
#  index_sign_ins_on_user_id     (user_id)
#

class SignIn < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :confidential,
    user_id: :confidential,
    anon_user_id: :confidential,
    sign_in_at: :confidential,
    sign_in_count: :confidential,
    authentication_option_id: :confidential,
    event_type: :confidential,
  )

  belongs_to :user, optional: true
end
