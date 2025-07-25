# This job will query for accounts that have been soft-deleted for more than 28 days
# and delete any data considered to be high-risk PII (personally identifiable information).
# This renders the accounts unrecoverable but retains as much useful non-PII data as possible.
class User::PiiScrubberJob < ApplicationJob
  def perform(dry_run: false, scrub_accounts_deleted_since: nil, max_accounts_to_scrub: nil)
    ExpiredDeletedAccountPiiScrubber.
      new(dry_run:, scrub_accounts_deleted_since:, max_accounts_to_scrub:).
      scrub_pii_from_expired_deleted_accounts!
  end
end
