# Works out what a sign_ins row represents, at the one place rows are written.
#
# Devise's trackable hook sees only the User and the request, so what can be recovered
# is recovered from the request: Warden records which strategy authenticated. Paths that
# authenticate a user without a Warden strategy say what they are by passing event_type:
# to sign_in (see config/initializers/sign_in_attribution.rb).
#
# A sign-in this cannot account for is recorded with a NULL event_type, meaning "not
# determined" -- the same thing every row written before the column existed means.
module Services::SignInAttribution
  EVENT_TYPE_KEY = 'cdo.sign_in.event_type'.freeze
  AUTHENTICATION_OPTION_ID_KEY = 'cdo.sign_in.authentication_option_id'.freeze
  WARDEN_EVENT_KEY = 'cdo.sign_in.warden_event'.freeze

  # Pulls our options out of a sign_in call's trailing hash, leaving the rest for Devise.
  # Mutates the hash in place; Devise's own extract_options! discards it afterwards
  # whether or not anything is left.
  def self.extract!(request, args)
    guard do
      options = args.last
      next unless options.is_a?(Hash)

      event_type = options.delete(:event_type)
      authentication_option = options.delete(:authentication_option)
      declare(request, event_type, authentication_option: authentication_option) if event_type
    end
  end

  # @param event_type [String] one of SignIn::EVENT_TYPES
  # @param authentication_option [AuthenticationOption, nil] the credential presented
  def self.declare(request, event_type, authentication_option: nil)
    return unless request.respond_to?(:env)

    request.env[EVENT_TYPE_KEY] = event_type
    request.env[AUTHENTICATION_OPTION_ID_KEY] = authentication_option&.id
  end

  # Warden's event says whether a strategy authenticated *this* set_user or whether code
  # called sign_in directly. winning_strategy alone cannot answer that: it stays set on
  # the proxy for the rest of the request, so a later sign_in would otherwise inherit the
  # credentials of an earlier one.
  def self.record_warden_event(warden, options)
    guard do
      next unless warden.request.respond_to?(:env)

      warden.request.env[WARDEN_EVENT_KEY] = options[:event]
    end
  end

  # @return [Array(String, Integer)] event_type and authentication_option_id, either of
  #   which may be nil.
  def self.resolve(user, request)
    guard([nil, nil]) do
      next [nil, nil] unless request.respond_to?(:env)

      # Toggle attribution dynamically: the sign_ins row is still written, just with the two attribution columns left
      # NULL.
      next [nil, nil] unless DCDO.get('sign_in_attribution_enabled', false)

      declared = request.env[EVENT_TYPE_KEY]
      next [declared, request.env[AUTHENTICATION_OPTION_ID_KEY]] if declared

      from_warden_strategy(user, request) || [nil, nil]
    end
  end

  # Raise rather than swallow where a failure gets seen and fixed: unit tests, continuous integration builds, and the
  # managed test server all run as `:test`. Production never raises.
  def self.raise_attribution_errors?
    CDO.rack_env?(:test)
  end

  private_class_method def self.from_warden_strategy(user, request)
    return nil unless request.env[WARDEN_EVENT_KEY] == :authentication

    case (strategy = request.env['warden']&.winning_strategy)
    when Devise::Strategies::DatabaseAuthenticatable
      [SignIn::CREDENTIAL, email_authentication_option_id(user, strategy)]
    end
  end

  # The email credential the password was checked against. Devise is configured with
  # authentication_keys {login, hashed_email}: hashed_email arrives already hashed, while
  # login holds either an email or a username. Hashing a username matches nothing, which
  # is the right answer -- username accounts have no email credential.
  private_class_method def self.email_authentication_option_id(user, strategy)
    conditions = strategy.authentication_hash || {}
    hashed_email = conditions[:hashed_email].presence ||
      conditions[:login].presence&.then {|login| User.hash_email(login.to_s.downcase)}
    return nil unless hashed_email

    user.authentication_options.find_by(
      credential_type: AuthenticationOption::EMAIL,
      hashed_email: hashed_email
    )&.id
  end

  private_class_method def self.guard(fallback = nil)
    yield
  rescue StandardError => exception
    raise if raise_attribution_errors? # Only raise in test environments.

    report_quietly(exception)
    fallback
  end

  private_class_method def self.report_quietly(exception, user = nil)
    Observability::Errors.report(exception, context: {user_id: user&.id})
  # Swallow exceptions so that reporting failures does not disrupt whatever.
  rescue StandardError
    nil
  end
end
