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
end
