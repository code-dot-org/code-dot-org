require 'cdo/firehose'
require 'dynamic_config/dcdo'

module SignUpTracking
  STUDY_NAME = 'account-sign-up-v2'
  NOT_IN_STUDY_GROUP = 'not-in-study'
  CONTROL_GROUP = 'control'
  NEW_SIGN_UP_GROUP = 'experiment'

  USER_ATTRIBUTES_OF_INTEREST = %i(id provider uid)

  def self.study_group(session)
    session[:sign_up_study_group] || NOT_IN_STUDY_GROUP
  end

  def self.new_sign_up_experience?(session)
    study_group(session) == NEW_SIGN_UP_GROUP
  end

  def self.begin_sign_up_tracking(session, split_test: false)
    unless session[:sign_up_tracking_expiration]&.future?
      session[:sign_up_uid] = SecureRandom.uuid.to_s
      session[:sign_up_tracking_expiration] = 1.day.from_now
    end

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
    FirehoseClient.instance.put_record(
      study: STUDY_NAME,
      event: 'load-sign-up-page',
      data_string: session[:sign_up_uid]
    )
  end

  def self.log_load_finish_sign_up(session)
    FirehoseClient.instance.put_record(
      study: STUDY_NAME,
      study_group: study_group(session),
      event: 'load-finish-sign-up-page',
      data_string: session[:sign_up_uid]
    )
  end

  def self.log_oauth_callback(provider, session)
    return unless provider && session
    if session[:sign_up_tracking_expiration]&.future?
      FirehoseClient.instance.put_record(
        study: STUDY_NAME,
        study_group: study_group(session),
        event: "#{provider}-callback",
        data_string: session[:sign_up_uid]
      )
    end
  end

  def self.log_sign_in(user, session, request)
    return unless user && session && request
    provider = request.env['omniauth.auth'].provider.to_s
    if session[:sign_up_tracking_expiration]&.future?
      tracking_data = {
        study: STUDY_NAME,
        event: "#{provider}-sign-in",
        data_string: session[:sign_up_uid]
      }
      FirehoseClient.instance.put_record(tracking_data)
    end
    end_sign_up_tracking session
  end

  def self.log_sign_up_result(user, session)
    return unless user && session
    sign_up_type = session[:sign_up_type]
    sign_up_type ||= user.email ? 'email' : 'other'
    if session[:sign_up_tracking_expiration]&.future?
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
      FirehoseClient.instance.put_record(tracking_data)
    end
    end_sign_up_tracking session if user.persisted?
  end
end
