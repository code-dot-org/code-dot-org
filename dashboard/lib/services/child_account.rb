module Services::ChildAccount
  # Transits the child's account to the grace period state.
  # @param user [User] the student account
  def self.start_grace_period(user)
    update_compliance(user, Policies::ChildAccount::ComplianceState::GRACE_PERIOD)
    user.save!
    Services::ChildAccount::EventLogger.log_grace_period_start(user)
  end

  # Sets the child's account to a lock_out state according to our Child Account
  # Policy.
  def self.lock_out(user)
    # Set the child's account to be locked out
    update_compliance(
      user,
      Policies::ChildAccount::ComplianceState::LOCKED_OUT
    )
    user.save!
    Services::ChildAccount::EventLogger.log_account_locking(user)
  end

  # Removes the current child's account compliance state.
  def self.remove_compliance(user)
    update_compliance(user, nil)
    user.save!
    Services::ChildAccount::EventLogger.log_compliance_removing(user)
  end

  # Updates the cap_status attribute to the given state.
  # @param {String} new_state - A constant from Policies::ChildAccount::ComplianceState
  def self.update_compliance(user, new_state)
    return unless user
    user.cap_status = new_state
    user.cap_status_date = DateTime.now
  end

  # Updates the User in the given PermissionRequest to indicate that their
  # parent has granted permission for the account to exist.
  # A confirmation email is sent to the parent after permission is granted.
  # @param {ParentalPermissionRequest} permission_request
  def self.grant_permission_request!(permission_request)
    return unless permission_request
    user = permission_request.user
    unless Policies::ChildAccount::ComplianceState.permission_granted?(user)
      update_compliance(user, Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED)
      user.save!
      Services::ChildAccount::EventLogger.log_permission_granting(user)
      parent_email = permission_request.parent_email
      ParentMailer.
        parent_permission_confirmation(parent_email).
        deliver_later(wait: Policies::ChildAccount::PERMISSION_GRANTED_MAIL_DELAY)
    end
  end
end
