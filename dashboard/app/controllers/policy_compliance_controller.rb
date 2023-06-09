class PolicyComplianceController < ApplicationController
  # GET /policy_compliance/child_account_consent
  # URL where parents or guardians give consent for their child to have an
  # account on Code.org
  # Our child account policy requires that parents give us permission to create
  # a Code.org account for their child if the child meets the following
  # criteria:
  #  * The child is under 13 years old.
  #  * The child is creating an account using an email address.
  #  * The child lives in Colorado.
  def child_account_consent
    @permission_granted = false
    #Get parent permission request
    token = params.require(:token)
    permission_request = ParentalPermissionRequest.find_by(uuid: token)
    return render status: :bad_request if permission_request.nil?
    #Get User
    user = permission_request.user
    #Update User
    if user.child_account_compliance_state != User::ChildAccountCompliance::PERMISSION_GRANTED
      user.child_account_compliance_state = User::ChildAccountCompliance::PERMISSION_GRANTED
      user.child_account_compliance_state_last_updated = DateTime.now.new_offset(0)
      user.save!
      parent_email = permission_request.parent_email
      ParentMailer.parent_permission_confirmation(parent_email).deliver_now
    end
    @permission_granted = true
    @permission_granted_date = user.child_account_compliance_state_last_updated
  end
end
