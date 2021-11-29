require 'cdo/delete_accounts_helper'

#
# Responsible for performing unrecoverable deletion of PII from our system.
#
# Built defensively:
# All database changes occur within a transaction, and we predetermine
# acceptable affected row counts for each step.  If any query exceeds the
# acceptable number of affected rows we roll back the transaction and move the
# account into a manual review queue where an engineer will handle it.
# Changes that occur outside of the database (removing content from S3)
# all occurs after point-of-no-return after the transaction successfully
# commits.
#
# Pushes audit logs to S3.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class AccountPurger
  attr_reader :dry_run
  alias :dry_run? :dry_run

  def initialize(dry_run: false, log: STDERR, bypass_safety_constraints: false)
    @dry_run = dry_run
    raise ArgumentError, 'dry_run must be boolean' unless [true, false].include? @dry_run

    @log = log
    raise ArgumentError, 'log must be an IO stream' unless @log.is_a?(IO) || @log.is_a?(StringIO)

    @bypass_safety_constraints = bypass_safety_constraints
    raise ArgumentError, 'bypass_safety_constraints must be boolean' unless [true, false].include? @bypass_safety_constraints
  end

  # Purge information for an individual user account.
  def purge_data_for_account(user)
    @log.puts "Purging user_id #{user.id}#{@dry_run ? ' (dry-run)' : ''}"
    purged_account_log = PurgedAccountLog.new user,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO

    really_purge_data_for_account user unless @dry_run

    purged_account_log.purged_at = Time.now
    purged_account_log.upload unless @dry_run

    @log.puts "Done purging user_id #{user.id}#{@dry_run ? ' (dry-run)' : ''}"
  end

  # Purge all information associated with an email address.
  # This includes calling purge_data_for_account for every account we can
  # associate with that email address, along with some additional logic to
  # ensure the email is removed from mailing lists, etc.
  def purge_data_for_email(_email)
    raise 'Not implemented' unless @dry_run
  end

  private def really_purge_data_for_account(user)
    ActiveRecord::Base.transaction do
      PEGASUS_DB.transaction do
        DeleteAccountsHelper.
          new(bypass_safety_constraints: @bypass_safety_constraints, log: @log).
          purge_user user
      end
    end
  end
end
