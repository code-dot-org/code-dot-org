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
  LTI_ROLES_KEY = 'https://purl.imsglobal.org/spec/lti/claim/roles'.freeze
  LTI_CUSTOM_CLAIMS = "https://purl.imsglobal.org/spec/lti/claim/custom".freeze

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
end
