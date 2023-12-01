require 'policies/lti'
require 'authentication_option'

class Queries::Lti
  def self.get_user(id_token)
    auth_id = Policies::Lti.generate_auth_id(id_token)
    User.find_by_credential(type: AuthenticationOption::LTI_V1, id: auth_id)
  end

  def self.get_lti_integration(issuer, client_id)
    LtiIntegration.find_by(issuer: issuer, client_id: client_id)
  end
end
