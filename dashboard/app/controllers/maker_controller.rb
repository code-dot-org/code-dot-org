require 'cdo/script_constants'

class MakerController < ApplicationController
  authorize_resource class: :maker_discount, except: [:home, :setup]

  # Maker Toolkit is currently used in CSD unit 6.
  # Retrieves the current CSD unit 6 level that the user is working on.
  def home
    # Redirect to login if not signed in
    authenticate_user!

    csd_unit_6_script = MakerController.maker_script current_user
    current_level = current_user.next_unpassed_progression_level(csd_unit_6_script)
    @csd_unit_6 = {
      assignableName: data_t_suffix('script.name', csd_unit_6_script[:name], 'title'),
      lessonName: current_level.stage.localized_title,
      linkToOverview: script_path(csd_unit_6_script),
      linkToLesson: script_next_path(csd_unit_6_script, 'next')
    }
  end

  def self.maker_script(for_user)
    csd6_17 = Script.get_from_cache(Script::CSD6_NAME)
    csd6_18 = Script.get_from_cache(Script::CSD6_2018_NAME)
    csd6_19 = Script.get_from_cache(Script::CSD6_2019_NAME)

    # Assigned course or script should take precedence.
    assigned = for_user.section_courses + for_user.section_scripts
    if assigned.include?(Course.get_from_cache(ScriptConstants::CSD_2019)) || assigned.include?(csd6_19)
      return csd6_19
    elsif assigned.include?(Course.get_from_cache(ScriptConstants::CSD_2018)) || assigned.include?(csd6_18)
      return csd6_18
    elsif assigned.include?(Course.get_from_cache(ScriptConstants::CSD_2017)) || assigned.include?(csd6_17)
      return csd6_17
    end

    # Otherwise, show the version with progress (defaulting to most recent).
    progress = UserScript.lookup_hash(for_user, [Script::CSD6_NAME, Script::CSD6_2018_NAME, Script::CSD6_2019_NAME])
    if progress[Script::CSD6_2019_NAME]
      csd6_19
    elsif progress[Script::CSD6_2018_NAME]
      csd6_18
    elsif progress[Script::CSD6_NAME]
      csd6_17
    else
      csd6_19
    end
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
        currently_distributing_discount_codes: false
      }
    }
  end

  # POST /maker/apply
  # Sets the teacher's intention to teach unit 6 and sends back eligibility information.
  def apply
    intention = params.require(:unit_6_intention)

    # Ensure we have an existing application and the school is eligible
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application
    return head :forbidden unless application.full_discount?

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
    return head :forbidden if application && application.has_confirmed_school?

    # Create our application
    application = CircuitPlaygroundDiscountApplication.create!(
      user: current_user,
      school_id: school_id,
      full_discount: school.maker_high_needs?
    )

    render json: {full_discount: application.full_discount?}
  end

  # POST /maker/complete
  # Called when eligible teacher clicks "Get Code."
  # Assigns a discount code and sends it back.
  def complete
    signature = params.require(:signature)

    # Must have started an application, and have said they were teaching unit 6, and confirmed their school
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
