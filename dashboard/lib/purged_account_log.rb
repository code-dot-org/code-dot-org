class PurgedAccountLog
  VALID_REASONS = [
    SOFT_DELETE_28_DAYS_AGO = 'soft delete 28 days ago',
    REQUESTED_BY_USER = 'requested by user',
  ]

  attr_accessor :pardot_ids, :poste_contact_ids, :purged_at, :confirmed_at

  def initialize(user, reason:)
    # enum indicating delete source
    # requested_by_user or expired_soft_delete
    @reason = reason
    raise ArgumentError, 'Invalid reason for purge' unless VALID_REASONS.include? reason

    # users.id still matchable against a purged row in our DB
    @id = user.id

    # to be kept in the 28-day delete case
    @hashed_email = user.hashed_email

    # These ids _should_ become meaningless since the user is
    # deleted from these systems - but having them here allows
    # us to verify that the ids don’t exist elsewhere.
    @pardot_ids = []
    @poste_contact_ids = []

    # When the system completed this hard-delete process
    @purged_at = nil

    # If requested by user, a place to record that we sent
    # them confirmation that their records have been deleted.
    @confirmed_at = nil
  end

  def to_yaml
    {
      id: @id,
      hashed_email: @hashed_email,
      pardot_ids: @pardot_ids,
      poste_contact_ids: @poste_contact_ids,
      reason: @reason,
      purged_at: @purged_at,
      confirmed_at: @confirmed_at,
    }.to_yaml
  end
end
