require 'cdo/throttle'

class InstantSectionsController < ApplicationController
  before_action :prevent_caching
  before_action :require_logged_out
  before_action :throttle_requests
  before_action :load_instant_section

  def show
    return head :not_found unless @section.open_for_instant_join?

    headers['csrf-token'] = form_authenticity_token
    render json: {code: @section.code}
  end

  def join
    student = @section.with_lock do
      return head :not_found unless @section.open_for_instant_join?

      new_student = User.create!(
        user_type: User::TYPE_STUDENT,
        provider: User::PROVIDER_SPONSORED,
        name: params[:name].to_s.strip
      )
      raise ActiveRecord::Rollback unless @section.add_student(new_student) == Section::ADD_STUDENT_SUCCESS

      new_student
    end
    return head :not_found unless student

    sign_in(:user, student)
    render json: {redirect_url: post_join_redirect_path}, status: :created
  rescue ActiveRecord::RecordInvalid
    head :unprocessable_entity
  end

  private def require_logged_out
    head :conflict if current_user
  end

  private def throttle_requests
    # A classroom shares an IP, so allow a full roster to join together.
    if Cdo::Throttle.throttle("instant_sections/ip/#{request.remote_ip}", 1200, 60)
      head :too_many_requests
    end
  end

  private def load_instant_section
    code = params[:section_code].to_s.strip.upcase
    @section = Section.find_by(code: code) if Section.valid_code?(code)
    head :not_found unless @section&.instant_section?
  end

  private def post_join_redirect_path
    if @section.script
      unit_group_unit = Queries::Courses.unit_group_unit(@section.script, @section.unit_group)
      course_unit_path(@section.unit_group, unit_group_unit.position)
    elsif @section.unit_group
      course_path(@section.unit_group)
    else
      root_path
    end
  end
end
