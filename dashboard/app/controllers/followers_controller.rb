class FollowersController < ApplicationController
  before_filter :authenticate_user!, except: [:student_user_new, :student_register, :index, :manage, :sections]

  # old teacher dashboard -- redirect to new teacher dashboard
  def index
    redirect_to teacher_dashboard_url
  end

  def manage
    redirect_to teacher_dashboard_url
  end

  def sections
    redirect_to teacher_dashboard_url
  end

  # join a section as a logged in student
  def create
    redirect_url = params[:redirect] || root_path
    
    if params[:section_code].blank?
      redirect_to redirect_url, alert: I18n.t('follower.error.blank_code')
      return
    end

    unless @section = Section.find_by_code(params[:section_code])
      redirect_to redirect_url, alert: I18n.t('follower.error.section_not_found', section_code: params[:section_code])
      return
    end

    teacher = @section.user

    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      @follower = Follower.where(user: teacher, student_user: current_user, section: @section).first_or_create!
    end

    redirect_to redirect_url, notice: I18n.t('follower.added_teacher', name: teacher.name)
   end

  # remove a section/teacher as a logged in student
  def remove
    @user = User.find(params[:student_user_id])
    @teacher = User.find(params[:teacher_user_id])

    f = Follower.where(user_id: @teacher.id, student_user_id: @user.id).first
    
    unless f.present?
      redirect_to root_path, alert: t('teacher.user_not_found')
      return
    end

    authorize! :destroy, f
    f.delete
    FollowerMailer.student_disassociated_notify_teacher(@teacher, @user).deliver if @teacher.email.present?
    redirect_to root_path, notice: t('teacher.student_teacher_disassociated', teacher_name: @teacher.name, student_name: @user.name)
  end

  # GET /join/XXXXXX
  # join a section as a new student
  def student_user_new
    @section = Section.find_by_code(params[:section_code])

    # make sure section_code is in the path (rather than just query string)
    if request.path != student_user_new_path(section_code: params[:section_code])
      redirect_to student_user_new_path(section_code: params[:section_code])
    elsif current_user && @section
      if current_user == @section.user
        redirect_to root_path, alert: I18n.t('follower.error.cant_join_own_section') and return
      end

      follower_same_user_teacher = current_user.followeds.where(:user_id => @section.user_id).first
      if follower_same_user_teacher.present?
        follower_same_user_teacher.update_attributes!(:section_id => @section.id)
      else
        Follower.create!(user_id: @section.user_id, student_user: current_user, section: @section)
      end
      redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name) and return
    end

    @user = User.new
  end

  # POST /join/XXXXXX
  # join a section as a new student
  def student_register
    @section = Section.find_by_code(params[:section_code])
    student_params = params[:user].permit([:name, :password, :gender, :age, :email, :hashed_email])

    @user = User.new(student_params)

    if current_user
      @user.errors.add(:username, "Please signout before proceeding")
    else
      @user.user_type = User::TYPE_STUDENT
      retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        if @user.save
          Follower.create!(user_id: @section.user_id, student_user: @user, section: @section)
          sign_in(:user, @user)
          redirect_to root_path, notice: I18n.t('follower.registered', section_name: @section.name)
          return
        end
      end
    end

    render "student_user_new", formats: [:html]
  end
end
