# The controller for seaching for and surfacing of internal admin data.
class AdminSearchController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  use_reader_connection_for_route(:find_students)

  MAX_PAGE_SIZE = 50
  MAX_TOTAL_SIZE = 1000

  def find_students
    users = User.with_deleted

    # If requested, filter...
    if params[:usernameFilter].present?
      users = users.where(username: params[:usernameFilter])
    end
    if params[:studentNameFilter].present?
      users = users.where(User.arel_table[:name].matches("%#{params[:studentNameFilter]}%"))
    end
    if params[:studentEmailFilter].present?
      hashed_email = User.hash_email params[:studentEmailFilter]
      users = users.where(hashed_email: hashed_email)
    end
    if params[:teacherNameFilter].present? || params[:teacherEmailFilter].present?
      teachers = User.
        where(User.arel_table[:name].matches("%#{params[:teacherNameFilter]}%")).
        where(User.arel_table[:email].matches("%#{params[:teacherEmailFilter]}%")).
        all
      if teachers.count > 1
        flash[:alert] = 'Multiple teachers matched the name and email search criteria.'
      end
      if teachers.first
        array_of_student_ids = teachers.first.students.pluck(:id)
        users = users.where(id: array_of_student_ids)
      end
    end
    if params[:sectionFilter].present?
      section = Section.with_deleted.find_by_code params[:sectionFilter]
      if section.nil?
        flash[:alert] = 'Section not found.'
      elsif section.deleted?
        flash[:alert] = 'Section is deleted.'
      end
      if section
        array_of_student_ids = section.students.pluck(:id)
        users = users.where(id: array_of_student_ids)
      end
    end
    @total_count = users.limit(MAX_TOTAL_SIZE).size
    @users = users.page(params[:page]).per(MAX_PAGE_SIZE)
  end

  def lookup_section
    load_section if params[:section_code]
  end

  def set_section_picture_passwords
    load_section
    if @section.nil? || @section.deleted?
      render :lookup_section, status: :unprocessable_entity
      return
    end

    unless @section.login_type == Section::LOGIN_TYPE_PICTURE
      flash.now[:alert] = 'Picture passwords can only be set for picture-password sections.'
      render :lookup_section, status: :unprocessable_entity
      return
    end

    picture_id = params[:secret_picture_id].to_s
    picture = SecretPicture.find_by(id: picture_id) if picture_id.match?(/\A\d+\z/)
    unless picture
      flash.now[:alert] = 'Choose a valid picture.'
      render :lookup_section, status: :unprocessable_entity
      return
    end

    student_ids = @section.students.where(user_type: User::TYPE_STUDENT).reorder(nil).distinct.pluck(:id)
    count = User.where(id: student_ids).update_all(secret_picture_id: picture.id, updated_at: Time.current)
    log_payload = {
      event: 'set_section_picture_passwords',
      namespace: 'admin',
      request_id: request.request_id,
      authenticated_user_id: current_user.id,
      section_id: @section.id,
      affected_user_ids: student_ids,
      updated_user_count: count
    }
    CDO.log.warn(log_payload.to_json)

    redirect_to lookup_section_admin_search_index_path(section_code: @section.code),
      notice: "Picture passwords set to #{picture.name} for #{count} students in #{@section.name}."
  end

  def undelete_section
    section = Section.with_deleted.find_by_code params[:section_code]
    if section.try(:deleted?)
      section.restore(recursive: true, recovery_window: 5.minutes)
      flash[:alert] = "Section (CODE: #{params[:section_code]}) undeleted!"
    else
      flash[:alert] = "Section (CODE: #{params[:section_code]}) not found or undeleted."
    end
    redirect_to :lookup_section_admin_search_index
  end

  private def load_section
    @section = if params[:section_code].present?
                 Section.with_deleted.find_by_code params[:section_code]
               end
    if @section.nil?
      flash.now[:alert] = 'Section code not found'
    elsif @section.deleted?
      flash.now[:alert] = 'Section is deleted'
    elsif @section.login_type == Section::LOGIN_TYPE_PICTURE
      @secret_pictures = SecretPicture.order(:name)
    end
  end
end
