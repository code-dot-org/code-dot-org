# == Schema Information
#
# Table name: lti_integrations
#
#  id                :bigint           not null, primary key
#  name              :string(255)
#  platform_id       :string(36)       not null
#  issuer            :string(255)      not null
#  client_id         :string(255)      not null
#  platform_name     :string(255)      not null
#  auth_redirect_url :string(255)      not null
#  jwks_url          :string(255)      not null
#  access_token_url  :string(255)      not null
#  admin_email       :string(255)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_lti_integrations_on_client_id    (client_id)
#  index_lti_integrations_on_issuer       (issuer)
#  index_lti_integrations_on_platform_id  (platform_id)
#
class LtiIntegration < ApplicationRecord
  validates :platform_id, uniqueness: true
  validates :issuer, presence: true
  validates :client_id, presence: true
  validates :platform_name, presence: true
  validates :auth_redirect_url, presence: true
  validates :jwks_url, presence: true
  validates :access_token_url, presence: true

  before_create :set_uuid

  def set_uuid
    self.platform_id = SecureRandom.uuid
  end
end
