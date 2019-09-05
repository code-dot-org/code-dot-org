# functionality for student users (teachers do this via the
# teacher-dashboard in pegasus and the api) to manipulate Followers,
# which means joining and leaving Sections (see Follower and Section
# models).

class FollowersController < ApplicationController
  before_action :load_section

  # GET /join/XXXXXX
  def student_user_new
    @user = current_user || User.new
  end

  # POST /join/XXXXXX
  # join a section
  def student_register
    if current_user
      @user = current_user
    elsif params[:user]
      user_type = params[:user][:user_type] == User::TYPE_TEACHER ? User::TYPE_TEACHER : User::TYPE_STUDENT
      @user = User.new(followers_params(user_type))
      @user.user_type = user_type
    else
      @user = User.new(user_type: User::TYPE_STUDENT)
      return render 'student_user_new', formats: [:html]
    end

    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      if @user.save && @section&.add_student(@user)
        sign_in(:user, @user)
        redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name)
        return
      end
    end

    render 'student_user_new', formats: [:html]
  end

  private

  def followers_params(user_type)
    allowed_params = params[:user].permit([:name, :password, :gender, :age, :email, :hashed_email])
    if user_type == User::TYPE_TEACHER
      allowed_params.merge(params[:user].permit([:school, :full_address]))
    end
    allowed_params
  end

  def redirect_url
    params[:redirect] || root_path
  end

  def load_section
    return if params[:section_code].blank?

    # Though downstream validations would raise an exception, we redirect to the admin directory to
    # improve user experience.
    if current_user&.admin?
      redirect_to admin_directory_path
      return
    end

    @section = Section.find_by_code(params[:section_code])
    # Note that we treat the section as not being found if the section user
    # (i.e., the teacher) does not exist (possibly soft-deleted) or is not a teacher
    unless @section && @section.user&.teacher?
      redirect_to redirect_url, alert: I18n.t('follower.error.section_not_found', section_code: params[:section_code])
      return
    end

    if current_user && current_user == @section.user
      redirect_to redirect_url, alert: I18n.t('follower.error.cant_join_own_section')
      return
    end

    # Redirect and provide an error for provider-managed sections.
    if @section&.provider_managed?
      provider = I18n.t(@section.login_type, scope: 'section.type')
      redirect_to root_path, alert: I18n.t('follower.error.provider_managed_section', provider: provider)
      return
    end

    # If this is a picture or word section, redirect to the section login page so that the student
    # does not have to type in the full URL.
    if [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD].include?(@section&.login_type)
      redirect_to controller: 'sections', action: 'show', id: @section.code
    end
  end
end
