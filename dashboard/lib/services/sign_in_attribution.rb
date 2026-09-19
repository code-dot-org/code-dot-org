# Works out what a sign_ins row represents, at the one place rows are written.
#
# Devise's trackable hook sees only the User and the request, so most of this is
# recovered from the request: Warden records which strategy authenticated, and an
# OmniAuth callback leaves its auth hash in the env. Paths that authenticate a user
# without either -- an LTI launch, a section code, code re-signing in a user it already
# trusts -- have nothing to recover, so they say what they are by passing event_type: to
# sign_in (see config/initializers/sign_in_attribution.rb).
#
# Anything left over is reported rather than silently stored as NULL: a sign-in path
# nobody taught this module about should surface as an alert, not as a gap in the data
# noticed six months later.
module Services::SignInAttribution
  # Nothing in the request accounted for a sign-in. Raised so that the one rescue in
  # resolve decides what happens to it, the same as any other failure there.
  class UnattributedSignIn < RuntimeError; end

  EVENT_TYPE_KEY = 'cdo.sign_in.event_type'.freeze
  AUTHENTICATION_OPTION_ID_KEY = 'cdo.sign_in.authentication_option_id'.freeze
  WARDEN_EVENT_KEY = 'cdo.sign_in.warden_event'.freeze

  # Pulls our options out of a sign_in call's trailing hash, leaving the rest for Devise.
  # Mutates the hash in place; Devise's own extract_options! discards it afterwards
  # whether or not anything is left.
  def self.extract!(request, args)
    options = args.last
    return unless options.is_a?(Hash)

    event_type = options.delete(:event_type)
    authentication_option = options.delete(:authentication_option)
    declare(request, event_type, authentication_option: authentication_option) if event_type
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
    return unless warden.request.respond_to?(:env)

    warden.request.env[WARDEN_EVENT_KEY] = options[:event]
  end

  # @return [Array(String, Integer)] event_type and authentication_option_id, either of
  #   which may be nil.
  def self.resolve(user, request)
    return [nil, nil] unless request.respond_to?(:env)

    declared = request.env[EVENT_TYPE_KEY]
    return [declared, request.env[AUTHENTICATION_OPTION_ID_KEY]] if declared

    from_warden_strategy(user, request) || from_omniauth(request) ||
      raise(UnattributedSignIn, "Sign-in recorded with no attribution: #{request.path}")
  rescue StandardError => exception
    # This runs inline in the sign-in path, inside Warden's set_user callback. Signing in
    # must never fail because of how we label the event, so everywhere but the
    # environments below, every failure here -- an unattributable sign-in, a database
    # error in a credential lookup, a reporting hiccup -- is reported and swallowed. The
    # row is then written with a NULL event_type, which is what every row predating the
    # column holds anyway.
    raise if raise_attribution_errors?

    report_quietly(exception, user)
    [nil, nil]
  end

  # Raise rather than swallow where a failure gets seen and fixed: the unit suite, CI,
  # and the managed test server all run as :test. Production never raises.
  def self.raise_attribution_errors?
    CDO.rack_env?(:test)
  end

  # Reporting the failure must not become the failure: this is the last thing standing
  # between a sign-in and an exception, so it swallows its own.
  private_class_method def self.report_quietly(exception, user)
    Observability::Errors.report(exception, context: {user_id: user&.id})
  rescue StandardError
    nil
  end

  private_class_method def self.from_warden_strategy(user, request)
    return nil unless request.env[WARDEN_EVENT_KEY] == :authentication

    case (strategy = request.env['warden']&.winning_strategy)
    when Devise::Strategies::Rememberable
      # The cookie identifies the user, never the credential that minted it.
      [SignIn::REMEMBERED, nil]
    when Devise::Strategies::DatabaseAuthenticatable
      [SignIn::CREDENTIAL, email_authentication_option_id(user, strategy)]
    when nil
      # Warden's login_as test helper claims :authentication without running a strategy; the application never does.
      [nil, nil] if Warden.respond_to?(:on_next_request)
    end
  end

  # Every OmniAuth provider lands here, so adding one needs no change: the callback's
  # auth hash names the exact credential by provider and external id.
  private_class_method def self.from_omniauth(request)
    auth_hash = request.env['omniauth.auth']
    return nil unless auth_hash

    option = AuthenticationOption.find_by_exact_credential(
      credential_type: auth_hash.provider.to_s,
      authentication_id: auth_hash.uid
    )
    [SignIn::CREDENTIAL, option&.id]
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
end
