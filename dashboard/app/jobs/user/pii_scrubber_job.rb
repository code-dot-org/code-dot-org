# This job will query for accounts that have been soft-deleted for more than 28 days
# and delete any data considered to be high-risk PII (personally identifiable information).
# This renders the accounts unrecoverable but retains as much useful non-PII data as possible.
class User::PiiScrubberJob < ApplicationJob
  def perform(dry_run: false, deleted_since: nil, limit: nil)
    return unless DCDO.get('pii-scrub-enabled', false)
    ExpiredDeletedAccountPiiScrubber.new(dry_run:, deleted_since:, limit:).call
  end
end
