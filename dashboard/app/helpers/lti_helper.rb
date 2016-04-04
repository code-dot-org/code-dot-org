
module LtiHelper

  def windows_complex_password
    # Take away # to avoid possible &# combo ...
    # specials = "~!@\$%^&*+=?".chars.to_a

    numbers  = (0..9).to_a
    [0, 1].each{ |ambiguous_character|
      numbers.delete ambiguous_character
    }

    alpha = ('a'..'z').to_a + ('A'..'Z').to_a
    %w{A E I O U a e i o u l}.each{ |ambiguous_character|
      alpha.delete ambiguous_character
    }

    characters = (alpha + numbers)
    password = Random.new.rand(7..11).times.map{characters.sample}

    # remove special chars for now...
    #
    # password << specials.sample unless
    #   password.join =~ Regexp.new(Regexp.escape(specials.join))

    password << numbers.sample unless
      password.join =~ Regexp.new(Regexp.escape(numbers.join))

    password.shuffle.join
  end

  #
  # ===========================================================
  #   LTI Signin
  # ===========================================================
  #
  def lti_signin_and_redirect(params, redirect_url)
    consumer_key = params[:oauth_consumer_key]
    consumer_secret = OauthCredentials.get_secret(consumer_key)
    if consumer_secret.blank?
      redirect_to new_user_registration_path,
        alert: "Sorry, invalid consumer_key [#{consumer_key}]"
      return
    end

    provider = IMS::LTI::ToolProvider.new(consumer_key, consumer_secret, params)
    if provider.valid_request?(request)
      delta = Time.now.to_i - params[:oauth_timestamp].to_i

      # 5 minute window
      if delta.abs > 60 * 5
        redirect_to new_user_registration_path,
          alert: "Sorry, launch request outside of time window [#{delta.abs}]"
        return
      end

      if user_signed_in?
        redirect_to redirect_url
      else
        # expected LTI params from tool consumer
        # see:
        # https://www.imsglobal.org/learning-tools-interoperability-sso-mechanism
        #
        # first_name = params[:lis_person_name_given]
        # last_name  = params[:lis_person_name_family]
        email      = params[:lis_person_contact_email_primary]
        full_name  = params[:lis_person_name_full]

        full_name = email if full_name.blank?

        if email.blank?
          redirect_to new_user_registration_path,
            alert: "Sorry, could not sign up--email missing from LTI request. Please contact your LMS admin."
          return
        end

        user = User.find_by_email(email)
        if user.nil?
          password = windows_complex_password

          if params[:roles] && params[:roles].downcase == "instructor"
            user_type = User::TYPE_TEACHER
          else
            user_type = User::TYPE_STUDENT
          end

          uu = User.new(email: email,
                        password: password,
                        password_confirmation: password,
                        name: full_name,
                        user_type: user_type)

          uu.skip_confirmation!
          uu.skip_reconfirmation!

          # force save without age/birthday
          uu.save(:validate => false)

          User.uncached do
            user = User.find_by_email(email)
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
