require 'user'
require 'authentication_option'

class Policies::Lti
  module AccessTokenScopes
    LINE_ITEM = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem'.freeze
    CONTEXT_MEMBERSHIP = 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'.freeze
  end

  ALL_SCOPES = AccessTokenScopes.constants.map do |scope|
    AccessTokenScopes.const_get(scope)
  end

  NAMESPACE = 'lti_v1_controller'.freeze
  JWT_CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'.freeze
  JWT_ISSUER = CDO.studio_url('', CDO.default_scheme).freeze
  MEMBERSHIP_CONTAINER_CONTENT_TYPE = 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json'.freeze
  TEACHER_ROLES = Set.new(
    [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator',
    ]
).freeze
  CONTEXT_LEARNER_ROLE = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner'.freeze
  LTI_ROLES_KEY = 'https://purl.imsglobal.org/spec/lti/claim/roles'.freeze
  LTI_CUSTOM_CLAIMS = "https://purl.imsglobal.org/spec/lti/claim/custom".freeze
  LTI_CONTEXT_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/context".freeze
  LTI_RESOURCE_LINK_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/resource_link".freeze
  LTI_DEPLOYMENT_ID_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/deployment_id".freeze
  LTI_NRPS_CLAIM = "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice".freeze

  # Prioritized lists for looking up a user's name from custom LTI variable claims.
  TEACHER_NAME_KEYS = [:name, :display_name, :full_name, :family_name, :given_name].freeze
  STUDENT_NAME_KEYS = [:name, :display_name, :full_name, :given_name].freeze

  LMS_PLATFORMS = {
    canvas_cloud: {
      name: 'Canvas'.freeze,
      issuer: 'https://canvas.instructure.com'.freeze,
      auth_redirect_url: 'https://sso.canvaslms.com/api/lti/authorize_redirect'.freeze,
      jwks_url: 'https://sso.canvaslms.com/api/lti/security/jwks'.freeze,
      access_token_url: 'https://sso.canvaslms.com/login/oauth2/token'.freeze,
    },
    canvas_beta_cloud: {
      name: 'Canvas - Beta'.freeze,
      issuer: 'https://canvas.beta.instructure.com'.freeze,
      auth_redirect_url: 'https://sso.beta.canvaslms.com/api/lti/authorize_redirect'.freeze,
      jwks_url: 'https://sso.beta.canvaslms.com/api/lti/security/jwks'.freeze,
      access_token_url: 'https://sso.beta.canvaslms.com/login/oauth2/token'.freeze,
    },
    canvas_test_cloud: {
      name: 'Canvas - Test'.freeze,
      issuer: 'https://canvas.test.instructure.com'.freeze,
      auth_redirect_url: 'https://sso.test.canvaslms.com/api/lti/authorize_redirect'.freeze,
      jwks_url: 'https://sso.test.canvaslms.com/api/lti/security/jwks'.freeze,
      access_token_url: 'https://sso.test.canvaslms.com/login/oauth2/token'.freeze,
    },
    schoology: {
      name: 'Schoology'.freeze,
      issuer: 'https://schoology.schoology.com'.freeze,
      auth_redirect_url: 'https://lti-service.svc.schoology.com/lti-service/authorize-redirect'.freeze,
      jwks_url: 'https://lti-service.svc.schoology.com/lti-service/.well-known/jwks'.freeze,
      access_token_url: 'https://lti-service.svc.schoology.com/lti-service/access-token'.freeze,
    },
  }

  MAX_COURSE_MEMBERSHIP = 650

  def self.get_account_type(roles)
    roles.each do |role|
      return User::TYPE_TEACHER if TEACHER_ROLES.include? role
    end
    return User::TYPE_STUDENT
  end

  def self.generate_auth_id(id_token)
    "#{id_token[:iss]}|#{id_token[:aud]}|#{id_token[:sub]}"
  end

  def self.lti?(user)
    !user.authentication_options.empty? && user.authentication_options.any?(&:lti?)
  end

  def self.issuer(user)
    auth_options = user.authentication_options.find(&:lti?)
    if auth_options
      return auth_options.authentication_id.split('|').first
    end
    nil
  end

  # Converts the `issuer` or `iss` LTI value to a string we would show to
  # users of Code.org
  # Example: 'https://schoology.schoology.com' -> 'Schoology'
  def self.issuer_name(issuer)
    return 'Canvas' if /canvas/.match?(issuer)
    return 'Schoology' if /schoology/.match?(issuer)
    I18n.t(:lti_v1, scope: [:section, :type])
  end

  # Returns the email provided by the LMS when creating the User through LTI
  # provisioning.
  def self.lti_provided_email(user)
    user.authentication_options.find(&:lti?).try(:email)
  end

  # Should we show the email form input when a user is creating
  # a Code.org account from an LTI supporting LMS?
  def self.show_email_input?(user)
    user.teacher? && Policies::Lti.lti?(user)
  end

  # Whether or not a roster sync can be performed for a user.
  def self.roster_sync_enabled?(user)
    user.teacher? && user.lti_roster_sync_enabled
  end

  def self.early_access?
    DCDO.get('lti_early_access_limit', false).present?
  end

  def self.early_access_closed?
    return unless early_access?

    lti_early_access_limit = DCDO.get('lti_early_access_limit', false)
    return false unless lti_early_access_limit.is_a?(Integer)

    LtiIntegration.count >= lti_early_access_limit
  end

  def self.early_access_banner_available?(user)
    user.teacher? && early_access? && lti?(user)
  end

  # Returns if the issuer accepts a Resource Link level membership service when retrieving membership for a context.
  def self.issuer_accepts_resource_link?(issuer)
    ['Canvas'].include?(issuer_name(issuer))
  end
end
