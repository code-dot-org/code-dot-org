class FollowersController < ApplicationController
  before_filter :authenticate_user!, except: [:student_user_new, :student_register, :index, :manage, :sections]
  before_filter :load_section, only: [:create, :student_user_new, :student_register]

  # join a section as a logged in student
  def create
    load_section

    @section.add_student(current_user)

    redirect_to redirect_url, notice: I18n.t('follower.added_teacher', name: @section.teacher.name)
  end

  # remove a section/teacher as a logged in student
  def remove
    @teacher = User.find(params[:teacher_user_id])

    f = Follower.where(user_id: @teacher.id, student_user_id: current_user.id).first

    unless f.present?
      redirect_to root_path, alert: t('teacher.user_not_found')
      return
    end

    authorize! :destroy, f
    f.delete
    FollowerMailer.student_disassociated_notify_teacher(@teacher, current_user).deliver_now if @teacher.email.present?
    redirect_to root_path, notice: t('teacher.student_teacher_disassociated', teacher_name: @teacher.name, student_name: current_user.name)
  end

  # GET /join/XXXXXX
  # if logged in, join the section, if not logged in, present a form to create a new user and log in
  def student_user_new
    load_section

    # make sure section_code is in the path (rather than just query string)
    if request.path != student_user_new_path(section_code: params[:section_code])
      redirect_to student_user_new_path(section_code: params[:section_code])
    elsif current_user && @section
      @section.add_student(current_user)

      redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name)
    else
      @user = User.new
      # render student_user_new
    end
  end

  # POST /join/XXXXXX
  # join a section as a new student
  def student_register
    load_section

    user_type = params[:user][:user_type] == User::TYPE_TEACHER ? User::TYPE_TEACHER : User::TYPE_STUDENT

    student_params = params[:user].permit([:name, :password, :gender, :age, :email, :hashed_email])
    if user_type == User::TYPE_TEACHER
      student_params.merge(params[:user].permit([:school, :full_address]))
    end

    @user = User.new(student_params)

    if current_user
      @user.errors.add(:username, "Please signout before proceeding")
    else
      @user.user_type = user_type == User::TYPE_TEACHER ? User::TYPE_TEACHER : User::TYPE_STUDENT
      retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        if @user.save
          @section.add_student(@user)
          sign_in(:user, @user)
          redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name)
          return
        end
      end
    end

    render "student_user_new", formats: [:html]
  end

  private

  def redirect_url
    params[:redirect] || root_path
  end

  def load_section
    if params[:section_code].blank?
      redirect_to redirect_url, alert: I18n.t('follower.error.blank_code')
      return
    end

    unless @section = Section.find_by_code(params[:section_code])
      redirect_to redirect_url, alert: I18n.t('follower.error.section_not_found', section_code: params[:section_code])
      return
    end

    if current_user && current_user == @section.user
      redirect_to redirect_url, alert: I18n.t('follower.error.cant_join_own_section') and return
    end
  end
end
