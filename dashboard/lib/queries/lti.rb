require 'policies/lti'
require 'authentication_option'

class Queries::Lti
  def self.get_user(id_token)
    auth_id = Policies::Lti.generate_auth_id(id_token)
    User.find_by_credential(type: AuthenticationOption::LTI_V1, id: auth_id)
  end

  def self.get_lti_integration(issuer, client_id)
    LtiIntegration.find_by(issuer: issuer, client_id: client_id)
  def self.get_user_from_nrps(client_id:, issuer:, nrps_member:)
    id_token = {
      sub: nrps_member[:user_id],
      aud: client_id,
      iss: issuer,
    }
    get_user(id_token)
  end

  def self.get_deployment(lti_integration_id, deployment_id)
    LtiDeployment.find_by(lti_integration_id: lti_integration_id, deployment_id: deployment_id)
  end

  def self.get_course_from_context(lti_integration_id, context_id)
    LtiCourse.find_by(lti_integration_id: lti_integration_id, context_id: context_id)
  end
end
