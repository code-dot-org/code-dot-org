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

  def self.log_load_sign_up(session)
    event_name = new_sign_up_experience?(session) ? 'load-new-sign-up-page' : 'load-sign-up-page'
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(session),
        event: event_name,
        data_string: session[:sign_up_uid]
      }
    )
  end

  def self.log_begin_sign_up(user, session)
    return unless user && session
    result = user.errors.empty? ? 'success' : 'error'
    tracking_data = {
      study: STUDY_NAME,
      study_group: study_group(session),
      event: "begin-sign-up-#{result}",
      data_string: session[:sign_up_uid],
      data_json: {
        errors: user.errors&.full_messages
      }.to_json
    }
    FirehoseClient.instance.put_record(:analysis, tracking_data)
  end

  def self.log_load_finish_sign_up(session, provider)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(session),
        event: "#{provider}-load-finish-sign-up-page",
        data_string: session[:sign_up_uid]
      }
    )
  end

  def self.log_cancel_finish_sign_up(session, provider)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_NAME,
        study_group: study_group(session),
        event: "#{provider}-cancel-finish-sign-up",
        data_string: session[:sign_up_uid]
      }
    )
  end

  def self.log_oauth_callback(provider, session)
    return unless provider && session
    if session[:sign_up_tracking_expiration]&.future?
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: STUDY_NAME,
          study_group: study_group(session),
          event: "#{provider}-callback",
          data_string: session[:sign_up_uid]
        }
      )
    end
  end

  def self.log_sign_in(user, session, request)
    return unless user && session && request
    provider = request.env['omniauth.auth'].provider.to_s
    if session[:sign_up_tracking_expiration]&.future?
      tracking_data = {
        study: STUDY_NAME,
        study_group: study_group(session),
        event: "#{provider}-sign-in",
        data_string: session[:sign_up_uid]
      }
      FirehoseClient.instance.put_record(:analysis, tracking_data)
    end
    end_sign_up_tracking session
  end

  def self.log_sign_up_result(user, session)
    return unless user && session
    sign_up_type = session[:sign_up_type]
    sign_up_type ||= user.email ? 'email' : 'other'
    result = user.persisted? ? 'success' : 'error'
    tracking_data = {
      study: STUDY_NAME,
      study_group: study_group(session),
      event: "#{sign_up_type}-sign-up-#{result}",
      data_string: session[:sign_up_uid],
      data_json: {
        detail: user.slice(*USER_ATTRIBUTES_OF_INTEREST),
        errors: user.errors&.full_messages
      }.to_json
    }
    FirehoseClient.instance.put_record(:analysis, tracking_data)

    end_sign_up_tracking session if user.persisted?
  end

  # @param flow [String] The account signup flow the user is starting e.g. "email_signup",
  # "section_signup"
  def self.log_gender_input_type_started(session, gender_input_type, locale, flow)
    # We don't need new tracking events if they user has already started the flow recently.
    return if session[:gender_input_flow] == flow && session[:gender_input_uid_expiration]&.future?
    # Identifier for tracking events for a single user.
    session[:gender_input_uid] = SecureRandom.uuid.to_s
    session[:gender_input_uid_expiration] = 30.minutes.from_now
    session[:gender_input_flow] = flow
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'gender-input-type',
        study_group: 'v2',
        event: 'input_seen',
        data_string: session[:gender_input_uid],
        data_json: {
          input_type: gender_input_type,
          locale: locale,
          flow: flow
        }.to_json
      }
    )
  end

  def self.log_gender_input_type_account_created(session, gender, gender_input_type, locale, flow, user)
    # Limit the gender to 100 characters, this should be sufficient for all languages.
    gender = gender&.truncate(100, omission: '')
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'gender-input-type',
        study_group: 'v2',
        event: 'account_created',
        data_string: session[:gender_input_uid],
        data_json: {
          input_type: gender_input_type,
          gender: gender,
          locale: locale,
          flow: flow,
          user_type: user&.user_type,
          age: user&.age,
          user_id: user&.id
        }.to_json
      }
    )
    # This is the last event for creating an account, so delete the tracking information.
    session.delete(:gender_input_uid)
    session.delete(:gender_input_uid_expiration)
    session.delete(:gender_input_type)
    session.delete(:gender_input_flow)
  end
end
