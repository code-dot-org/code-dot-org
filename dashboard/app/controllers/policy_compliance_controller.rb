class PolicyComplianceController < ApplicationController
  # GET /policy_compliance/new_student_account_consent
  # URL where parents or guardians give consent for their under-13 child to
  # have an account on Code.org
  def new_student_account_consent
    @permission_granted = false
    token = request.params[:token]
    return render status: :bad_request if token.blank?
    #Get parent permission request
    permission_request = ParentalPermissionRequest.find_by(uuid: token)
    return render status: :bad_request if permission_request.nil?
    #Get User
    user = permission_request.user
    #Update User
    if user.cpa_compliance != User::CpaCompliance::PERMISSION_GRANTED
      user.cpa_compliance = User::CpaCompliance::PERMISSION_GRANTED
      user.cpa_compliance_date = DateTime.now.new_offset(0)
      user.save!
    end
    @permission_granted = true
    @permission_granted_date = user.cpa_compliance_date
  end
end
