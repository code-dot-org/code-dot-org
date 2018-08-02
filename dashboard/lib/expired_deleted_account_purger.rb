require 'cdo/chat_client'

#
# Locates accounts that were soft-deleted more than <n> days ago and
# performs a hard-delete on those accounts, permanently removing the account
# data from our system.  Adds accounts to manual review queue if an automatic
# delete encounters problems or exceeds some safety limit.
#
# Sends metrics to New Relic:
# - Number of soft-deleted accounts in system
# - Number of accounts purged
# - Depth of manual review queue
#
# Logs activity to Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class ExpiredDeletedAccountPurger
  attr_reader :dry_run
  alias :dry_run? :dry_run
  attr_reader :deleted_after
  attr_reader :deleted_before
  attr_reader :max_accounts_to_purge

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # Only purge accounts soft-deleted after this date.
    # The default is when we released the updated messaging about hard-deletes.
    @deleted_after = options[:deleted_after] || Time.parse('2018-07-31 4:18pm PDT')
    raise ArgumentError.new('deleted_after must be Time') unless @deleted_after.is_a? Time

    # Only purge accounts soft-deleted this long ago.
    # Default is based on our agreement with at least one district.
    @deleted_before = options[:deleted_before] || 28.days.ago
    raise ArgumentError.new('deleted_before must be Time') unless @deleted_before.is_a? Time

    # Do nothing if more than this number of accounts would be purged.
    # We'll want to adjust this over time to match activity on our site.
    @max_accounts_to_purge = options[:max_accounts_to_purge] || 100
    raise ArgumentError.new('max_accounts_to_purge must be Integer') unless @max_accounts_to_purge.is_a? Integer
  end

  def purge_expired_deleted_accounts!
    num_accounts_purged = 0

    say "Purging expired deleted accounts#{@dry_run ? ' (dry-run)' : ''}"

    accounts_to_purge = expired_deleted_accounts.to_a
    if accounts_to_purge.size > @max_accounts_to_purge
      raise StandardError.new "Found #{num_accounts_to_delete} accounts to " \
        "purge, which exceeds the configured limit of #{@max_accounts_to_purge}. " \
        "Abandoning run."
    end

    account_purger = AccountPurger.new dry_run: @dry_run
    accounts_to_purge.each do |account|
      account_purger.purge_data_for_account account
      num_accounts_purged += 1
    rescue StandardError
      say "unable to purge account #{account}, moving to manual review queue"
      # TODO: Move to manual review queue
    end
    say 'done'
  ensure
    record_metrics num_accounts_purged
  end

  def record_metrics(num_accounts_purged)
    # Number of soft-deleted accounts in system
    NewRelic::Agent.record_metric("Custom/DeletedAccountPurger/SoftDeletedAccounts", soft_deleted_accounts.count)
    # Number of accounts purged
    NewRelic::Agent.record_metric("Custom/DeletedAccountPurger/AccountsPurged", num_accounts_purged)
    # Depth of manual review queue
    NewRelic::Agent.record_metric("Custom/DeletedAccountPurger/ManualReviewQueueDepth", 0) # TODO
  end

  def soft_deleted_accounts
    User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil)
  end

  def expired_deleted_accounts
    soft_deleted_accounts.where 'deleted_at BETWEEN :start_date AND :end_date',
      start_date: @deleted_after,
      end_date: @deleted_before
  end

  # Send messages to Slack #cron-daily room.
  private def say(message)
    ChatClient.message 'cron-daily', message
  end
end
