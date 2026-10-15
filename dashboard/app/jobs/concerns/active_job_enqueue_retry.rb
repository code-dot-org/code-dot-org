# frozen_string_literal: true

module ActiveJobEnqueueRetry
  extend ActiveSupport::Concern

  ENQUEUE_ATTEMPTS = 3
  RETRYABLE_ENQUEUE_ERRORS = [
    ActiveRecord::AdapterTimeout,
    ActiveRecord::ConnectionTimeoutError,
    ActiveRecord::Deadlocked,
    ActiveRecord::LockWaitTimeout,
    ActiveRecord::StatementTimeout,
  ].freeze

  included do
    around_enqueue do |_job, block|
      Retryable.retryable(
        on: RETRYABLE_ENQUEUE_ERRORS,
        tries: ENQUEUE_ATTEMPTS,
        sleep: proc {rand(0.5..1.0)},
        &block
      )
    end
  end
end
