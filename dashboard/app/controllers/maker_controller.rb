class MakerController < ApplicationController
  authorize_resource class: :maker_discount, except: [:home, :setup, :login_code, :display_code, :confirm_login]

  # Maker Toolkit is currently used in standalone Create Devices with Apps unit.
  # Retrieves the relevant Create Devices with Apps unit version based on self.maker_script.
  def home
    # Redirect to login if not signed in
    authenticate_user!

    maker_unit_for_user = MakerController.maker_script current_user
    current_level = current_user.next_unpassed_progression_level(maker_unit_for_user)
    @maker_unit = {
      assignableName: data_t_suffix('script.name', maker_unit_for_user[:name], 'title'),
      lessonName: current_level.lesson.localized_title,
      linkToOverview: script_path(maker_unit_for_user),
      linkToLesson: script_next_path(maker_unit_for_user, 'next')
    }
  end

  # Returns which devices script version to show:
  #   Assigned script should take precedence - show most recent version that's been assigned.
  #   Otherwise, show the most recent version with progress.
  #   If none of the above applies, default to most recent.
  def self.maker_script(for_user)
    Unit.latest_assigned_version('devices', for_user) ||
      Unit.latest_version_with_progress('devices', for_user) ||
      Unit.latest_stable_version('devices')
  end

  def setup
  end

  # GET /maker/discountcode
  def discountcode
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    render 'discountcode', locals: {
      script_data: {
        application: application_status,
        is_admin: current_user.admin?,
        currently_distributing_discount_codes: true
      }
    }
  end

  # POST /maker/apply
  # Sets the teacher's intention to teach the maker unit and sends back eligibility information.
  def apply
    intention = params.require(:unit_6_intention)

    # Ensure we have an existing application and the school is eligible
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application

    school = School.find(application.school_id)
    return head :forbidden unless school.try(:maker_high_needs?)

    # validate that we're eligible (this should be visible already, but we should
    # never have submitted this request if not eligible in these ways
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    return head :forbidden unless application_status[:is_pd_eligible] && application_status[:is_progress_eligible]

    # finally, update our application
    application.update!(unit_6_intention: intention)

    render json: {eligible: application.eligible_unit_6_intention?}
  end

  # POST /maker/schoolchoice
  # begins a discount code application
  # Sets the teacher's chosen school and sends back eligibility information.
  def schoolchoice
    school_id = params.require(:nces)
    school = School.find(school_id)

    # check to see if we have an existing application for any users associated with
    # this studio_person_id (in which case we can't start another)
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :forbidden if application&.has_confirmed_school?

    # Create our application
    # For 2020, applications by default get the non "full discount" (ie, without shipping)
    CircuitPlaygroundDiscountApplication.create!(
      user: current_user,
      school_id: school_id,
      full_discount: (%w(AK HI).include? school.state)
    )

    render json: {school_high_needs_eligible: school.try(:maker_high_needs?)}
  end

  # GET /maker/login_code
  # renders a page for users to enter a login key
  def login_code
  end

  # GET /maker/display_code
  # renders a page for users to copy and paste a login key
  def display_code
    # Generate encrypted code to display to user
    user_auth = current_user&.find_credential(AuthenticationOption::GOOGLE)
    if user_auth.nil?
      @secret_code = nil
      return
    end

    secret_str = Time.now.strftime('%Y%m%dT%H%M%S%z') + user_auth[:authentication_id] + user_auth[:credential_type]
    @secret_code = Encryption.encrypt_string_utf8(secret_str)
  end

  # GET /maker/confirm_login
  # Renders a page to confirm uses want to login via Google OAuth
  # This route is need to convert the GET request from the Maker App into
  # a POST that can be used to login via Google OAuth
  def confirm_login
    return_to = params[:user_return_to]
    session[:user_return_to] = return_to if return_to.present?
  end

  # POST /maker/complete
  # Called when eligible teacher clicks "Get Code."
  # Assigns a discount code and sends it back.
  def complete
    signature = params.require(:signature)

    # Must have started an application, and have said they were teaching the maker unit, and confirmed their school
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application
    return head :forbidden unless application.admin_set_status? || (application.eligible_unit_6_intention? &&
      application.has_confirmed_school? && !application.circuit_playground_discount_code_id)

    code = CircuitPlaygroundDiscountCode.claim(application.full_discount?)
    return head :not_found unless code

    # associate the code with this application, and log signature
    application.update!(signature: signature, signed_at: DateTime.now, circuit_playground_discount_code_id: code.id)

    render json: {code: code.code, expiration: code.expiration}
  end

  def application_status
    return head :forbidden unless current_user.admin?
    user = User.from_identifier(params.require(:user))
    return head :not_found unless user

    render json: {application: CircuitPlaygroundDiscountApplication.admin_application_status(user)}
  end

  def override
    return head :forbidden unless current_user.admin?

    full_discount = params.require(:full_discount)
    user = User.from_identifier(params.require(:user))

    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(user.studio_person_id)

    if application
      # If we already have a code, void it
      if application.circuit_playground_discount_code_id
        application.circuit_playground_discount_code.update!(voided_at: Time.now)
      end
      application.update!(
        admin_set_status: true,
        full_discount: full_discount == 'true',
        circuit_playground_discount_code_id: nil
      )
    else
      CircuitPlaygroundDiscountApplication.create!(
        user_id: user.id,
        admin_set_status: true,
        full_discount: full_discount == 'true'
      )
    end

    render json: {application: CircuitPlaygroundDiscountApplication.admin_application_status(user)}
  end
end
