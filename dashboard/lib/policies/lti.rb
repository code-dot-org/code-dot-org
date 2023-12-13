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

  def self.get_account_type(id_token)
    id_token[LTI_ROLES_KEY].each do |role|
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
end
