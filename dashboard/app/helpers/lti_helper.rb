
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

  def lti_param_missing_msg(pp)
    "Sorry, could not sign up--[#{pp}] missing from LTI request. Please contact your LMS admin."
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
        # expected LTI params from tool consumer
        # see:
        #https://www.imsglobal.org/learning-tools-interoperability-sso-mechanism
        #
        # For code-dot-org make User unique via provider/user_id:
        #   uid is required for LTI sign-on
        #   age is required for User::TYPE_STUDENT
        #
        pvd_id     = "lti_#{consumer_key}"
        uid        = params[:user_id] || ""
        age        = params[:custom_age]
        full_name  = params[:lis_person_name_full]
        full_name  = "Lti #{uid.first}" if full_name.blank?
        email      = SecureRandom.uuid + "@code.org"

        user_type  = lti_role_to_user_type(params[:roles])
        age ||= 21 if user_type == User::TYPE_TEACHER

        if uid.blank?
          redirect_to new_user_registration_path,
            alert: lti_param_missing_msg("user_id")
          return
        end
        if age.blank?
          redirect_to new_user_registration_path,
            alert: lti_param_missing_msg("custom_age")
          return
        end

        user = User.where(provider: pvd_id, uid: uid).first_or_create
        if user.new_record?
          user.provider  = pvd_id
          user.uid       = uid
          user.age       = age
          user.email     = email
          user.name      = full_name
          user.user_type = user_type

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
            alert: "Sorry, could not sign in User [#{uid}]. Please contact your LMS admin."
        end
      end
    else
      redirect_to new_user_registration_path,
        alert: "Sorry, bad LTI request. Please contact your LMS admin."
    end
  end
end
