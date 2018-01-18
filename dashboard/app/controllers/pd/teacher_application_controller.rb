class Pd::TeacherApplicationController < ApplicationController
  include Pd::PageHelper

  EMAIL_TEMPLATE_PREFIX = '2017_teacher_application_'.freeze
  DEFAULT_MANAGE_PAGE_SIZE = 25

  load_and_authorize_resource(
    :teacher_application,
    class: 'Pd::TeacherApplication',
    id_param: 'teacher_application_id'
  )

  # GET /pd/teacher_application
  def new
    redirect_to pd_application_teacher_path

    # TODO: remove
    # authorize! :create, Pd::TeacherApplication
    #
    # @application_data = {
    #   accountEmail: current_user.email,
    #   hashedAccountEmail: current_user.hashed_email
    # }
    #
    # if Pd::TeacherApplication.exists?(user: current_user)
    #   render :submitted
    # end
  end

  # GET /pd/teacher_application/manage
  # Admin only
  def manage
    query = params[:q]
    if query
      # It's a valid id. Navigate directly to that application.
      if query =~ /^\d+$/ && Pd::TeacherApplication.exists?(query.to_i)
        redirect_to action: :edit, teacher_application_id: query
        return
      end

      # Search emails
      @teacher_applications = @teacher_applications.where(
        'primary_email LIKE ? OR secondary_email LIKE ?',
        "%#{query}%", "%#{query}%"
      )
    end

    @teacher_applications = @teacher_applications.includes(:user, :accepted_program).page(page).per(page_size)
    view_options(full_width: true)
  end

  # GET /pd/teacher_application/manage/:teacher_application_id
  # Admin only
  def edit
    # Some old teacher applications are invalid because the primary email doesn't match the account
    # pre-validate here so that error is displayed if applicable
    @teacher_application.admin_managed = true
    @teacher_application.validate

    view_options(full_width: true)
  end

  # PATCH /pd/teacher_application/manage/:teacher_application_id
  # Admin only
  def update
    if @teacher_application.update application_params.merge(admin_managed: true)
      flash[:notice] = "Teacher Application #{@teacher_application.id} saved."
      redirect_to action: :edit
    else
      render :edit
    end
  end

  # POST /pd/teacher_application/manage/:teacher_application_id/upgrade_to_teacher
  def upgrade_to_teacher
    @teacher_application.user.update(user_type: User::TYPE_TEACHER, email: @teacher_application.primary_email)
    redirect_to action: :edit
  end

  # GET /pd/teacher_application/manage/:teacher_application_id/email
  # Admin only
  def construct_email
    unless @teacher_application.valid?
      redirect_to action: :edit
      return
    end

    @param_rules = Pd::TeacherApplicationEmailParams.new(@teacher_application).labeled_rules
  end

  # POST /pd/teacher_application/manage/:teacher_application_id/email
  # Admin only
  def send_email
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, params[:email])
    @param_rules = email_params.labeled_rules

    unless email_params.valid?
      @errors = email_params.errors
      render :construct_email
      return
    end

    # Params check out. Now send the email
    final_params = email_params.to_final_params
    decision = final_params.delete(:decision)
    email = final_params.delete(:email)
    name = final_params.delete(:name)

    recipient = Poste2.ensure_recipient email, name: name
    Poste2.send_message "#{EMAIL_TEMPLATE_PREFIX}#{decision}", recipient, final_params.stringify_keys

    flash[:notice] = "Teacher Application #{@teacher_application.id} #{decision} email sent to #{email}"
    redirect_to action: :edit
  end

  private

  def application_params
    params.require(:pd_teacher_application).permit(
      :move_to_user,
      :primary_email,
      :secondary_email,
      :accepted_workshop,
      :regional_partner_name,
      :program_registration_json,
      :selected_course
    )
  end

  def page
    params[:page] || 1
  end

  def page_size
    return DEFAULT_MANAGE_PAGE_SIZE unless params.key? :page_size
    params[:page_size] == 'All' ? @teacher_applications.count : params[:page_size]
  end
end
