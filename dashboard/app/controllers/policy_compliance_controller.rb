require 'policies/child_account'
require 'services/child_account'
require 'digest/md5'

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
    @student_id = user.id
  end

  # GET /policy_compliance/pending_permission_request
  def pending_permission_request
    @pending_permission_request = current_user.latest_parental_permission_request

    if @pending_permission_request
      render json: ChildAccount::PendingPermissionRequestSerializer.new(@pending_permission_request).as_json
    else
      head :no_content
    end
  end

  # POST /policy_compliance/child_account_consent
  # This URL creates a parental permission request. It is invoked via the
  # lockout panel or potentially user settings by the child account.
  #
  # There are several limits imposed that are reflected in the logic below:
  # * Student may only send permission requests to 3 unique email addressed per day.
  # * Student may only "resend" to a particular email address at most 2 times.
  # * Student cannot send a request to their own email address.
  #
  # This is to control for abuse vectors that might try to overwhelm our email
  # system. It is, effectively, a limit of 9 emails, on average, per studetnt pet
  # day.
  #
  # When such a limit is reached, this logic silently 'succeeds'. That is, it
  # acts like the email was sent and sends no notice to the student it was not.
  def child_account_consent_request
    parent_email = params.require(:'parent-email')

    permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
      child_account: current_user, parent_email: parent_email
    )

    respond_to do |format|
      format.html do
        return head :bad_request unless Cdo::EmailValidator.email_address?(parent_email)

        permission_request_form.request

        # Redirect back to the page spawning the request
        redirect_back fallback_location: lockout_path
      end

      format.json do
        if permission_request_form.request
          render status: :created, json: ChildAccount::PendingPermissionRequestSerializer.new(permission_request_form.record).as_json
        else
          render status: :unprocessable_entity, json: {error: permission_request_form.errors.full_messages.first}
        end
      end
    end
  end
end
