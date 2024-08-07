require 'policies/child_account'

class Queries::ChildAccount
  # Get all the User's who are not compliant with the Child Account Policy for
  # longer than the grace period (7 days).
  # @param scope {User::ActiveRecord_Relation} The range of User's to query,
  # used for testing.
  # @param expiration_date [Time] User's who were locked out before this date
  # are considered 'expired'. Used for testing.
  def self.expired_accounts(scope: User.all, expiration_date: 7.days.ago)
    # Filter for accounts which don't have parent permission then filter for
    # accounts which have been locked out before the expiration_date
    scope.where(
      cap_status: Policies::ChildAccount::ComplianceState::LOCKED_OUT,
      cap_status_date: ..expiration_date
    )
  end
end
