require 'cdo/firehose'
require 'dynamic_config/dcdo'

module SignUpTracking
  STUDY_NAME = 'account-sign-up-v5'
  NOT_IN_STUDY_GROUP = 'not-in-study'
  CONTROL_GROUP = 'control-v4'
  NEW_SIGN_UP_GROUP = 'experiment-v4'

  USER_ATTRIBUTES_OF_INTEREST = %i(id provider uid)

  def self.study_group(session)
    session[:sign_up_study_group] || NOT_IN_STUDY_GROUP
  end

  def self.new_sign_up_experience?(session)
    study_group(session) == NEW_SIGN_UP_GROUP
  end

  def self.begin_sign_up_tracking(session, split_test: false)
    # No-op if sign_up_tracking_expiration is set and in the future.
    return if session[:sign_up_tracking_expiration]&.future?

    session[:sign_up_uid] = SecureRandom.uuid.to_s
    session[:sign_up_tracking_expiration] = 1.day.from_now

    if split_test
      session[:sign_up_study_group] = Random.rand(100) < split_test_percentage ?
        NEW_SIGN_UP_GROUP : CONTROL_GROUP
    end
  end

  def self.end_sign_up_tracking(session)
    session.delete(:sign_up_tracking_expiration)
    session.delete(:sign_up_uid)
    session.delete(:sign_up_study_group)
  end

  # DCDO 'sign_up_split_test' can be used to dynamically configure how many
  #   users see the new sign up experience.
  # When 0 (default) sends no users to new experience.
  # When x sends x% of users to new experience
  # When 100 sends all users to new experience
  def self.split_test_percentage
    DCDO.get('sign_up_split_test', 0)
  end

  def self.log_load_sign_up(request)
    this_session = request.session
    event_name = new_sign_up_experience?(this_session) ? 'load-new-sign-up-page' : 'load-sign-up-page'
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(this_session),
        event: event_name,
        data_string: this_session[:sign_up_uid]
      }
    )

    Metrics::Events.log_event(
      request: request,
      event_name: event_name,
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )
  end

  def self.log_begin_sign_up(user, request)
    return unless user && request
    this_session = request.session
    result = user.errors.empty? ? 'success' : 'error'
    tracking_data = {
      study: STUDY_NAME,
      study_group: study_group(this_session),
      event: "begin-sign-up-#{result}",
      data_string: this_session[:sign_up_uid],
      data_json: {
        errors: user.errors&.full_messages
      }.to_json
    }
    FirehoseClient.instance.put_record(:analysis, tracking_data)

    Metrics::Events.log_event(
      request: request,
      event_name: "begin-sign-up-#{result}",
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )
  end

  def self.log_load_finish_sign_up(request, provider)
    this_session = request.session
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(this_session),
        event: "#{provider}-load-finish-sign-up-page",
        data_string: this_session[:sign_up_uid]
      }
    )

    Metrics::Events.log_event(
      request: request,
      event_name: "#{provider}-load-finish-sign-up",
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )
  end

  def self.log_cancel_finish_sign_up(request, provider)
    this_session = request.session
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(this_session),
        event: "#{provider}-cancel-finish-sign-up",
        data_string: this_session[:sign_up_uid]
      }
    )

    Metrics::Events.log_event(
      request: request,
      event_name: "#{provider}-cancel-finish-sign-up",
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )
  end

  def self.log_oauth_callback(provider, request)
    return unless provider && request
    this_session = request.session
    event_name = this_session[:sign_up_tracking_expiration]&.future? ? "#{provider}-signup-callback" : "#{provider}-callback"

    if this_session[:sign_up_tracking_expiration]&.future?
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: STUDY_NAME,
          study_group: study_group(this_session),
          event: "#{provider}-callback",
          data_string: this_session[:sign_up_uid]
        }
      )
    end

    Metrics::Events.log_event(
      request: request,
      event_name: event_name,
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )
  end

  def self.log_sign_in(user, request)
    return unless user && request
    this_session = request.session
    provider = request.env['omniauth.auth'].provider.to_s
    if this_session[:sign_up_tracking_expiration]&.future?
      tracking_data = {
        study: STUDY_NAME,
        study_group: study_group(this_session),
        event: "#{provider}-sign-in",
        data_string: this_session[:sign_up_uid]
      }
      FirehoseClient.instance.put_record(:analysis, tracking_data)

      Metrics::Events.log_event(
        request: request,
        event_name: "#{provider}-sign-in",
        metadata: {
          study: STUDY_NAME,
          study_group: study_group(this_session),
        },
        )
    end
    end_sign_up_tracking this_session
  end

  def self.log_sign_up_result(user, request)
    return unless user && request
    this_session = request.session
    sign_up_type = this_session[:sign_up_type]
    sign_up_type ||= user.email ? 'email' : 'other'
    result = user.persisted? ? 'success' : 'error'
    tracking_data = {
      study: STUDY_NAME,
      study_group: study_group(this_session),
      event: "#{sign_up_type}-sign-up-#{result}",
      data_string: this_session[:sign_up_uid],
      data_json: {
        detail: user.slice(*USER_ATTRIBUTES_OF_INTEREST),
        errors: user.errors&.full_messages
      }.to_json
    }
    FirehoseClient.instance.put_record(:analysis, tracking_data)

    Metrics::Events.log_event(
      request: request,
      event_name: "#{sign_up_type}-sign-up-#{result}",
      metadata: {
        study: STUDY_NAME,
        study_group: study_group(this_session),
      },
      )

    end_sign_up_tracking this_session if user.persisted?
  end
end
