module ChildAccountHelper
  # The pre-lockdown parent permission banner data.
  # @param user [User] the student (child) account
  # @param request [ActionDispatch::Request] the web request
  # @return [Hash, nil]
  def parental_permission_banner_data(user, request)
    student_lockout_date = Policies::ChildAccount.lockout_date(user, approximate: true)

    if request.params.key?(:show_parental_permission_banner)
      student_lockout_date ||= Cpa::ALL_USER_LOCKOUT_DATE
    else
      return unless student_lockout_date
      return unless DCDO.get('cap_student_warnings_enabled', false)
    end

    {
      lockoutDate: student_lockout_date.iso8601,
    }
  end

  # Renders the pre-lockdown parent permission banner for a student account.
  # @param user [User] the student (child) account
  # @param request [ActionDispatch::Request] the web request
  # @return [String] the HTML for the pre-lockdown parent permission banner
  def render_parental_permission_banner(user, request)
    data = parental_permission_banner_data(user, request)
    data && render(partial: 'policy_compliance/parental_permission/banner', locals: data)
  end

  # Renders the pre-lockdown parent permission modal for a student account.
  # @param user [User] the student (child) account
  # @param request [ActionDispatch::Request] the web request
  # @return [String] the HTML for the pre-lockdown parent permission modal
  def render_parental_permission_modal(user, request)
    force_display = request.params.key?(:show_parental_permission_modal)
    student_lockout_date = Policies::ChildAccount.lockout_date(user, approximate: true)

    if force_display
      student_lockout_date ||= Cpa::ALL_USER_LOCKOUT_DATE
    else
      return unless student_lockout_date
      return unless DCDO.get('cap_student_warnings_enabled', false)
      return if user.latest_parental_permission_request
    end

    render partial: 'policy_compliance/parental_permission/modal',
           locals: {
             studentUuid: user.uuid,
             inSection: user.sections_as_student.present?,
             lockoutDate: student_lockout_date.iso8601,
             forceDisplay: force_display,
           }
  end
end
