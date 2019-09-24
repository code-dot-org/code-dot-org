# == Schema Information
#
# Table name: queued_account_purges
#
#  id                :integer          not null, primary key
#  user_id           :integer          not null
#  reason_for_review :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_queued_account_purges_on_user_id  (user_id) UNIQUE
#

#
# Represents an account that has been identified as needing to be purged from
# our system but for some reason we were unable to perform this action
# automatically. Common reasons a record would end up here:
#
# - An exception was raised while deleting the account
# - Some safety constraint was violated while deleting the account
#   (e.g. too many sections would be deleted)
#
# Rows in this table should be addressed manually by engineers, by investigating
# the queueing cause and then using the AccountPurger to delete the account.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class QueuedAccountPurge < ApplicationRecord
  belongs_to :user

  # Some errors are known to be intermittent, such as external services being temporarily
  # unavailable. If an account purge was queued for one of these reasons, our system can
  # automatically retry it on the next run without developer intervention.
  AUTO_RETRYABLE_REASONS = %w{Pardot::InvalidApiKeyException}
  scope :needing_manual_review, -> {where.not(reason_for_review: AUTO_RETRYABLE_REASONS)}

  # Used by developers to resolve an account purge queued for manual review,
  # after they've investigated the account and decided it's ready to purge.
  def resolve!
    AccountPurger.new(bypass_safety_constraints: true).purge_data_for_account User.with_deleted.find(user_id)
    destroy!
  end
end
