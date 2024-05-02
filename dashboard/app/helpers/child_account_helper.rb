module ChildAccountHelper
  # Renders the pre-lockdown parent permission modal for a student account.
  # @param user [User] the student (child) account
  # @param request [ActionDispatch::Request] the web request
  # @return [String] the HTML for the pre-lockdown parent permission modal
  def render_parental_permission_modal(user, request)
    force_display = request.params.key?(:show_parental_permission_modal)
    student_lockout_date = Policies::ChildAccount.lockout_date(user)

    if force_display
      student_lockout_date ||= DateTime.parse('2024-07-01T00:00:00MST')
    else
      return unless student_lockout_date
      return unless Cpa.cpa_experience(request) == Cpa::ALL_USER_LOCKOUT_WARNING
      return if Policies::ChildAccount::ComplianceState.request_sent?(user)
    end

    render partial: 'policy_compliance/parental_permission/modal',
           locals: {student_uuid: user.uuid, lockout_date: student_lockout_date, force_display: force_display}
  end
end
