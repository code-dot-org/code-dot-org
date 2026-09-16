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

  # authentication_options are soft-deleted when a user disconnects a provider, but a sign-in that happened before that
  # is still a fact about the past.
  belongs_to :authentication_option, -> {with_deleted}, optional: true

  EVENT_TYPES = [
    CREDENTIAL = 'credential'.freeze,             # A password, OAuth, or LTI credential was presented in this sign in request.
    SECTION_CODE = 'section_code'.freeze,         # Student signed in with Section Code and secret word or picture.
    REMEMBERED = 'remembered'.freeze,             # A remember-me cookie, not a credential the user presented.
    REGISTRATION = 'registration'.freeze,         # The sign-in Devise performs immediately after creating the account.
    REAUTHENTICATION = 'reauthentication'.freeze, # Re-signed in an already-authenticated user without any credential
  ].freeze
end
