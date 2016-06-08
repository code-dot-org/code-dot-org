
module LtiHelper

  #
  # LTI role can be blank, one, or multiple (comma separated).
  # https://www.imsglobal.org/specs/ltiv1p0/implementation-guide#toc-19
  #
  # e.g. "Instructor, TeachingAssistant, ContentDeveloper"
  #
  def lti_role_to_user_type(roles)
    return User::TYPE_STUDENT if roles.blank?

    arr = roles.downcase.split(/\s*,\s*/).uniq.compact
    if arr.length == 1 && arr.include?('learner')
      User::TYPE_STUDENT
    else
      User::TYPE_TEACHER
    end
  end

  #
  # ===========================================================
  #   LTI Signin
  # ===========================================================
  #
  def lti_signin_and_redirect(params, redirect_url)
    if params[:oauth_consumer_key].blank?
      redirect_to new_user_registration_path,
        alert: "Sorry, launch request must specify :oauth_consumer_key"
      return
    end

    consumer_key = params[:oauth_consumer_key]
    consumer_secret = OauthCredentials.get_secret(consumer_key)
    if consumer_secret.blank?
      redirect_to new_user_registration_path,
        alert: "Sorry, invalid consumer_key [#{consumer_key}]"
      return
    end

    provider = IMS::LTI::ToolProvider.new(consumer_key, consumer_secret, params)
    if provider.valid_request?(request)
      if params[:oauth_timestamp].blank?
        redirect_to new_user_registration_path,
          alert: "Sorry, launch request must specify :oauth_timestamp"
        return
      end

      delta = Time.now.to_i - params[:oauth_timestamp].to_i
      if delta.abs > 5.minutes
        redirect_to new_user_registration_path,
          alert: "Sorry, launch request outside of time window [#{delta.abs}]"
        return
      end

      if user_signed_in?
        redirect_to redirect_url
      else
        #expected LTI params from tool consumer
        #see:
        #https://www.imsglobal.org/learning-tools-interoperability-sso-mechanism
        #
        email      = params[:lis_person_contact_email_primary]
        full_name  = params[:lis_person_name_full]
        full_name  = email.split('@').first if full_name.blank?

        if email.blank?
          redirect_to new_user_registration_path,
            alert: "Sorry, could not sign up--email missing from LTI request. Please contact your LMS admin."
          return
        end

        user = User.find_by_email_or_hashed_email(email)
        if user.nil?
          user_type = lti_role_to_user_type(params[:roles])

          # Age is not part of the LTI basic launch data.  Use similar
          # strategy as Clever sign-in. Make sure email gets hidden in the end
          # for Students...
          age = ((user_type == User::TYPE_TEACHER) ? 21 : 8)

          user = User.new(email: email,
                          provider: "lti_#{consumer_key}",
                          name: full_name, age: age, user_type: user_type)

          user.skip_confirmation!
          user.skip_reconfirmation!
          user.save

          User.uncached do
            user = User.find_by_email_or_hashed_email(email)
          end
        end

        sign_in(user)

        if user_signed_in?
          redirect_to redirect_url
        else
          redirect_to new_user_registration_path,
            alert: "Sorry, could not sign in [#{email}]. Please contact your LMS admin."
        end
      end
    else
      redirect_to new_user_registration_path,
        alert: "Sorry, bad LTI request. Please contact your LMS admin."
    end
  end
end
