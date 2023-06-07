class PolicyComplianceController < ApplicationController
  # GET /policy_compliance/child_account_consent
  # URL where parents or guardians give consent for their child to have an
  # account on Code.org
  def child_account_consent
    @permission_granted = false
    token = request.params[:token]
    return render status: :bad_request if token.blank?
    #Get parent permission request
    permission_request = ParentalPermissionRequest.find_by(uuid: token)
    return render status: :bad_request if permission_request.nil?
    #Get User
    user = permission_request.user
    #Update User
    if user.child_account_compliance_state != User::ChildAccountCompliance::PERMISSION_GRANTED
      user.child_account_compliance_state = User::ChildAccountCompliance::PERMISSION_GRANTED
      user.child_account_compliance_state_last_updated = DateTime.now.new_offset(0)
      user.save!
    end
    @permission_granted = true
    @permission_granted_date = user.child_account_compliance_state_last_updated
  end
end
