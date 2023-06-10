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
    #Get User
    user = permission_request.user
    #Update User
    if user.child_account_compliance_state != User::ChildAccountCompliance::PERMISSION_GRANTED
      user.update_child_account_compliance(User::ChildAccountCompliance::PERMISSION_GRANTED)
      user.save!
      parent_email = permission_request.parent_email
      ParentMailer.parent_permission_confirmation(parent_email).deliver_now
    end
    @permission_granted = true
    @permission_granted_date = user.child_account_compliance_state_last_updated
  end

  # POST /policy_compliance/child_account_consent
  # This URL creates a parental permission request. It is invoked via the
  # lockout panel or potentially user settings by the child account.
  def child_account_consent_request
    # If we already comply, don't suddenly invalid it
    if current_user.child_account_compliance_state == User::ChildAccountCompliance::PERMISSION_GRANTED
      redirect_back fallback_location: '/lockout' and return
    end

    # Only allow three unique permission requests per day
    date = Date.today
    permission_requests = ParentalPermissionRequest.where(
      created_at: date.midnight..date.end_of_day
    ).limit(3).count

    # Create a ParentalPermissionRequest token for user and parent email
    # When the student 'updates' the parental email, we actually just create a
    # new request row.
    permission_request = ParentalPermissionRequest.find_or_create_by(
      user: current_user,
      parent_email: params[:"parent-email"]
    )

    # If we are making a new request but already sent too many today,
    # just bail and return whence we came
    if !permission_request.persisted? && permission_requests >= 3
      redirect_back fallback_location: '/lockout' and return
    end

    # If this is not a new row, we are resending the email
    if permission_request.persisted?
      permission_request.resends_sent += 1
    end

    # Do not send more than three emails to the same email
    if permission_request.resends_sent >= 3
      redirect_back fallback_location: '/lockout' and return
    end

    # Save (will reassign the updated_at date)
    permission_request.save!

    # Update the User
    current_user.update_child_account_compliance(User::ChildAccountCompliance::REQUEST_SENT)
    current_user.save!

    # Send the request email
    ParentMailer.parent_permission_request(
      permission_request.parent_email,
      url_for(
        action: :child_account_consent,
        controller: :policy_compliance,
        token: permission_request.uuid
      )
    ).deliver_now

    # Redirect back to the page spawning the request
    redirect_back fallback_location: '/lockout'
  end
end
