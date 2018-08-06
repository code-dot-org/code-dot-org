#
# Responsible for performing unrecoverable deletion of PII from our system.
#
# Built defensively:
# All database changes occur within a transaction, and we predetermine
# acceptable affected row counts for each step.  If any query exceeds the
# acceptable number of affected rows we roll back the transaction and move the
# account into a manual review queue where an engineer will handle it.
# Changes that occur outside of the database (removing content from Solr,
# Pardot, S3) all occurs after point-of-no-return after the transaction
# successfully commits.
#
# Pushes audit logs to S3.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class AccountPurger
  attr_reader :dry_run
  alias :dry_run? :dry_run

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run
  end

  # Purge information for an individual user account.
  def purge_data_for_account(_user)
    raise 'Not implemented' unless @dry_run
  end

  # Purge all information associated with an email address.
  # This includes calling purge_data_for_account for every account we can
  # associate with that email address, along with some additional logic to
  # ensure the email is removed from mailing lists, etc.
  def purge_data_for_email(_email)
    raise 'Not implemented' unless @dry_run
  end
end
