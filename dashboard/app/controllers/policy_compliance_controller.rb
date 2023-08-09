require 'policies/child_account'
require 'services/child_account'

class PolicyComplianceController < ApplicationController
  before_action :authenticate_user!, except: [:child_account_consent]

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
    Services::ChildAccount.grant_permission_request!(permission_request)
    @permission_granted = true
    user = permission_request.user
    @permission_granted_date = user.child_account_compliance_state_last_updated
  end

  # POST /policy_compliance/child_account_consent
  # This URL creates a parental permission request. It is invoked via the
  # lockout panel or potentially user settings by the child account.
  #
  # There are several limits imposed that are reflected in the logic below:
  # * Student may only send permission requests to 3 unique email addressed per day.
  # * Student may only "resend" to a particular email address at most 2 times.
  #
  # This is to control for abuse vectors that might try to overwhelm our email
  # system. It is, effectively, a limit of 9 emails, on average, per studetnt pet
  # day.
  #
  # When such a limit is reached, this logic silently 'succeeds'. That is, it
  # acts like the email was sent and sends no notice to the student it was not.
  def child_account_consent_request
    # If we already comply, don't suddenly invalid it
    if current_user.child_account_compliance_state == Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      redirect_back fallback_location: lockout_path and return
    end

    # Only allow three unique permission requests per day
    date = Time.zone.today
    daily_request_count = ParentalPermissionRequest.where(
      user: current_user,
      created_at: date.midnight..date.end_of_day
    ).limit(3).count

    # Create a ParentalPermissionRequest token for user and parent email
    # When the student 'updates' the parental email, we actually just create a
    # new request row.
    permission_request = ParentalPermissionRequest.find_or_initialize_by(
      user: current_user,
      parent_email: params.require(:'parent-email')
    )

    # If we are making a new request but already sent too many today,
    # just bail and return whence we came
    if permission_request.new_record? && daily_request_count >= 3
      redirect_back fallback_location: lockout_path and return
    end

    # If this is not a new row, we are resending the email
    if permission_request.persisted?
      permission_request.resends_sent += 1
    end

    # Do not send more than three emails to the same email
    if permission_request.resends_sent >= 3
      redirect_back fallback_location: lockout_path and return
    end

    # Save (will reassign the updated_at date)
    permission_request.save!

    # Update the User
    Services::ChildAccount.update_compliance(
      current_user,
      Policies::ChildAccount::ComplianceState::REQUEST_SENT
    )
    current_user.save!

    # Send the request email
    ParentMailer.parent_permission_request(
      permission_request.parent_email,
      url_for(
        action: :child_account_consent,
        controller: :policy_compliance,
        token: permission_request.uuid,
        only_path: false,
      )
    ).deliver_now

    # Redirect back to the page spawning the request
    redirect_back fallback_location: lockout_path
  end
end
