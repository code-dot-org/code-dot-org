require 'cdo/firehose'

module SignUpTracking
  def self.begin_sign_up_tracking(session)
    unless session[:sign_up_tracking_expiration]&.future?
      session[:sign_up_uid] = SecureRandom.uuid.to_s
      session[:sign_up_tracking_expiration] = 5.minutes.from_now
    end
  end

  def self.log_sign_in(user, session, request)
    return unless user && session && request
    provider = request.env['omniauth.auth'].provider.to_s
    if session[:sign_up_tracking_expiration]&.future?
      tracking_data = {
        study: 'account-sign-up',
        event: "#{provider}-sign-in",
        data_string: session[:sign_up_uid]
      }
      FirehoseClient.instance.put_record(tracking_data)
    end
  end

  def self.log_sign_up_result(user, session)
    return unless user && session
    sign_up_type = session[:sign_up_type]
    sign_up_type ||= user.email ? 'email' : 'other'
    if session[:sign_up_tracking_expiration]&.future?
      result = user.persisted? ? 'success' : 'error'
      tracking_data = {
        study: 'account-sign-up',
        event: "#{sign_up_type}-sign-up-#{result}",
        data_string: session[:sign_up_uid],
        data_json: {
          detail: user.to_json,
          errors: user.errors&.messages
        }.to_json
      }
      FirehoseClient.instance.put_record(tracking_data)
    end
  end
end
