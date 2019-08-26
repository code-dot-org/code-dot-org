# functionality for student users (teachers do this via the
# teacher-dashboard in pegasus and the api) to manipulate Followers,
# which means joining and leaving Sections (see Follower and Section
# models).

class FollowersController < ApplicationController
  before_action :authenticate_user!, except: [:student_user_new, :student_register]
  before_action :load_section, only: [:create, :create_sync, :student_user_new, :student_register]

  # join a section as a logged in student
  def create
    @section.add_student current_user

    redirect_to redirect_url, notice: I18n.t('follower.added_teacher', name: @section.teacher.name)
  end

  # Remove enrollment in a section (as a student in the section).
  def remove
    @section = Section.find_by_code params[:section_code]
    if @section
      f = Follower.where(section: @section.id, student_user_id: current_user.id).first
    end

    unless @section && f
      # TODO(asher): Change the alert message to section.
      redirect_to root_path, alert: t(
        'follower.error.section_not_found',
        section_code: params[:section_code]
      )
      return
    end

    @teacher = @section.user

    authorize! :destroy, f
    f.delete
    # Though in theory required, we are missing an email address for many teachers.
    if @teacher && @teacher.email.present?
      FollowerMailer.student_disassociated_notify_teacher(@teacher, current_user).deliver_now
    end
    teacher_name = @teacher ? @teacher.name : I18n.t('user.deleted_user')
    redirect_to(
      root_path,
      notice: t(
        'teacher.student_teacher_disassociated',
        teacher_name: teacher_name,
        section_code: params[:section_code]
      )
    )
  end

  # GET /join/XXXXXX
  # if logged in, join the section, if not logged in, present a form to create a new user and log in
  def student_user_new
    # Though downstream validations would raise an exception, we redirect to the admin directory to
    # improve user experience.
    if current_user && current_user.admin?
      redirect_to admin_directory_path
      return
    end

    if @section && @section.provider_managed?
      provider = I18n.t(@section.login_type, scope: 'section.type')
      redirect_to root_path, alert: I18n.t('follower.error.provider_managed_section', provider: provider)
      return
    end

    if current_user && @section
      @section.add_student current_user

      redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name)
    else
      @user = User.new

      # if this is a picture or word section, redirect to the section login page so that the student
      # does not have to type in the full URL
      if @section && [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD].include?(@section.login_type)
        redirect_to controller: 'sections', action: 'show', id: @section.code
      end

      # if there is no logged in user and no section or an e-mail section, render the default
      # student_user_new view which includes the section code form or sign up form
    end
  end

  # POST /join/XXXXXX
  # join a section as a new student
  def student_register
    user_type = params[:user][:user_type] == User::TYPE_TEACHER ? User::TYPE_TEACHER : User::TYPE_STUDENT
    @user = User.new(followers_params(user_type))
    @user.user_type = user_type

    if current_user
      @user.errors.add(:username, "Please signout before proceeding")
      render 'student_user_new', formats: [:html]
      return
    end

    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      if @user.save
        @section.add_student @user
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
    if params[:section_code].blank?
      if request.path != student_user_new_path(section_code: params[:section_code])
        # if user submitted the section form without a code /join
        redirect_to student_user_new_path(section_code: params[:section_code])
      end
      return
    end

    @section = Section.find_by_code(params[:section_code])
    # Note that we treat the section as not being found if the section user
    # (i.e., the teacher) does not exist (possibly soft-deleted) or is not a teacher
    unless @section && @section.user && @section.user.teacher?
      redirect_to redirect_url, alert: I18n.t('follower.error.section_not_found', section_code: params[:section_code])
      return
    end

    if current_user && current_user == @section.user
      redirect_to redirect_url, alert: I18n.t('follower.error.cant_join_own_section')
      return
    end
  end
end
