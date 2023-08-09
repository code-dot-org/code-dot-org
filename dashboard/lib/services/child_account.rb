class Services::ChildAccount
  # Sets the child's account to a lock_out state according to our Child Account
  # Policy.
  def self.lock_out(user)
    return unless user
    # Verify the account has not already started the lock out process.
    return if user.child_account_compliance_state
    # Set the child's account to be locked out
    update_compliance(
      user,
      Policies::ChildAccount::ComplianceState::LOCKED_OUT
    )
    user.child_account_compliance_lock_out_date = DateTime.now
  end

  # Updates the child_account_compliance_state attribute to the given state.
  # @param {String} new_state - A constant from Policies::ChildAccount::ComplianceState
  def self.update_compliance(user, new_state)
    return unless user
    user.child_account_compliance_state = new_state
    user.child_account_compliance_state_last_updated = DateTime.now
  end

  # Updates the User in the given PermissionRequest to indicate that their
  # parent has granted permission for the account to exist.
  # A confirmation email is sent to the parent after permission is granted.
  # @param {ParentalPermissionRequest} permission_request
  def self.grant_permission_request!(permission_request)
    return unless permission_request
    user = permission_request.user
    if user.child_account_compliance_state != Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      update_compliance(user, Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED)
      user.save!
      parent_email = permission_request.parent_email
      ParentMailer.parent_permission_confirmation(parent_email).deliver_now
    end
  end
end
