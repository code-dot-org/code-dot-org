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
    if any_csd_2017?(for_user) && !any_csd_2018?(for_user)
      Script.get_from_cache(Script::CSD6_NAME)
    else
      Script.get_from_cache(Script::CSD6_2018_NAME)
    end
  end

  def self.any_csd_2017?(for_user)
    !for_user.user_scripts.joins(:script).
      where(scripts: {name: ScriptConstants::CATEGORIES[:csd]}).empty? ||
      for_user.section_courses.include?(Course.get_from_cache(ScriptConstants::CSD_2017))
  end

  def self.any_csd_2018?(for_user)
    !for_user.user_scripts.joins(:script).
      where(scripts: {name: ScriptConstants::CATEGORIES[:csd_2018]}).empty? ||
      for_user.section_courses.include?(Course.get_from_cache(ScriptConstants::CSD_2018))
  end

  def setup
  end

  def discountcode
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    render 'discountcode', locals: {script_data: {application: application_status, is_admin: current_user.admin?}}
  end

  # begins a discount code application
  def apply
    intention = params.require(:unit_6_intention)

    # check to see if we have an existing application for any users associated with
    # this studio_person_id (in which case we can't start another)
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :forbidden if application

    # validate that we're eligible
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    return head :forbidden unless application_status[:is_pd_eligible] && application_status[:is_progress_eligible]

    # finally, create our application
    application = CircuitPlaygroundDiscountApplication.create!(user: current_user, unit_6_intention: intention)

    render json: {eligible: application.eligible_unit_6_intention?}
  end

  def schoolchoice
    school_id = params.require(:nces)

    school = School.find(school_id)

    # Must have started an application, and have said they were teaching unit 6
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application
    return head :forbidden unless application.eligible_unit_6_intention? && !application.has_confirmed_school?

    application.update!(school_id: school_id, full_discount: school.high_needs?)

    render json: {full_discount: application.full_discount?}
  end

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
