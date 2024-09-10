class Policies::Lti
  module AccessTokenScopes
    LINE_ITEM = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem'.freeze
    CONTEXT_MEMBERSHIP = 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'.freeze
  end

  module MessageType
    CLAIM = :'https://purl.imsglobal.org/spec/lti/claim/message_type'
    SUPPORTED = [
      RESOURCE_LINK_REQUEST = 'LtiResourceLinkRequest'.freeze,
    ].freeze
  end

  ALL_SCOPES = AccessTokenScopes.constants.map do |scope|
    AccessTokenScopes.const_get(scope)
  end

  NAMESPACE = 'lti_v1_controller'.freeze
  JWT_CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'.freeze
  JWT_ISSUER = CDO.studio_url('', CDO.default_scheme).freeze
  DEFAULT_TARGET_LINK_URI = CDO.studio_url('/lti/v1/sync_course', CDO.default_scheme).freeze

  MEMBERSHIP_CONTAINER_CONTENT_TYPE = 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json'.freeze
  TEACHER_ROLES = Set.new(['http://purl.imsglobal.org/vocab/lis/v1/institution/person#Instructor',
                           'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor']
).freeze
  STAFF_ROLES = Set.new(
    [
      *TEACHER_ROLES,
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator',
    ]
).freeze
  CONTEXT_LEARNER_ROLE = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner'.freeze
  CONTEXT_MENTOR_ROLE = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor'.freeze
  LTI_ROLES_KEY = 'https://purl.imsglobal.org/spec/lti/claim/roles'.freeze
  LTI_CUSTOM_CLAIMS = "https://purl.imsglobal.org/spec/lti/claim/custom".freeze
  LTI_CONTEXT_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/context".freeze
  LTI_RESOURCE_LINK_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/resource_link".freeze
  LTI_DEPLOYMENT_ID_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/deployment_id".freeze
  LTI_NRPS_CLAIM = "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice".freeze
  LTI_PLATFORM_CONFIGURATION = "https://purl.imsglobal.org/spec/lti-platform-configuration".freeze
  CANVAS_ACCOUNT_NAME = "https://canvas.instructure.com/lti/account_name".freeze

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

  DYNAMIC_REGISTRATION_CONFIG = {
    application_type: "web",
    response_types: ["id_token"],
    grant_types: ["client_credentials", "implicit"],
    initiate_login_uri: CDO.studio_url('/lti/v1/login', CDO.default_scheme),
    redirect_uris: [CDO.studio_url('/lti/v1/authenticate', CDO.default_scheme)],
    client_name: "Code.org",
    jwks_uri: CDO.studio_url('/oauth/jwks', CDO.default_scheme),
    token_endpoint_auth_method: "private_key_jwt",
    contacts: ["platform@code.org"],
    scope: ALL_SCOPES.join(' '),
    "https://purl.imsglobal.org/spec/lti-tool-configuration" => {
      domain: CDO.dashboard_site_host,
      description: "Code.org LTI Integration",
      target_link_uri: DEFAULT_TARGET_LINK_URI,
      custom_parameters: {
        email: "$Person.email.primary",
        full_name: "$Person.name.full",
        given_name: "$Person.name.given",
        family_name: "$Person.name.family",
        display_name: "$Person.name.display",
        section_ids: "$Canvas.course.sectionIds",
        section_names: "$com.instructure.User.sectionNames"
      },
      claims: %w[sub iss name given_name family_name nickname picture email locale],
      messages: [
        {
          type: "LtiResourceLinkRequest",
          label: "Launch Code.org",
          placements: ["link_selection"],
          icon_uri: CDO.studio_url('/images/logo.svg', CDO.default_scheme),
        },
        {
          type: "LtiResourceLinkRequest",
          label: "Launch Code.org",
          placements: ["assignment_selection"],
          icon_uri: CDO.studio_url('/images/logo.svg', CDO.default_scheme),
        }
      ]
    }
  }.freeze

  MAX_COURSE_MEMBERSHIP = 650

  def self.get_account_type(roles)
    roles.each do |role|
      return User::TYPE_TEACHER if STAFF_ROLES.include? role
    end
    return User::TYPE_STUDENT
  end

  # Returns true if any of the user's roles is the LTI instructor role
  def self.lti_teacher?(roles)
    (Set.new(roles) & TEACHER_ROLES).any?
  end

  def self.lti?(user)
    !user.authentication_options.empty? && user.authentication_options.any?(&:lti?)
  end

  def self.only_lti_auth?(user)
    user.authentication_options&.length == 1 && user.authentication_options.first.lti?
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

  def self.find_platform_by_issuer(issuer)
    LMS_PLATFORMS.values.find {|platform| platform[:issuer] == issuer}
  end

  def self.find_platform_name_by_issuer(issuer)
    platform_name, _ = LMS_PLATFORMS.find {|_, platform| platform[:issuer] == issuer}
    platform_name.to_s
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

  # Returns if the issuer accepts a Resource Link level membership service when retrieving membership for a context.
  def self.issuer_accepts_resource_link?(issuer)
    ['Canvas'].include?(issuer_name(issuer))
  end

  # Force Schoology and Canvas through iframe mitigation flow
  def self.force_iframe_launch?(issuer)
    %w[Schoology Canvas].include?(issuer_name(issuer))
  end

  def self.feedback_available?(user)
    user.teacher? && lti?(user) && user.created_at <= 2.days.ago
  end

  # Check if a partial registration is in progress for an LTI user.
  def self.lti_registration_in_progress?(session)
    PartialRegistration.in_progress?(session) && PartialRegistration.get_provider(session) == AuthenticationOption::LTI_V1
  end

  def self.account_linking?(session, user)
    session[:lms_landing].present? && only_lti_auth?(user) && !user.lms_landing_opted_out
  end
end
