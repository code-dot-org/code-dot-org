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
end
