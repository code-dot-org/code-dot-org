# This model represents a failed job that has been archived from the `delayed_jobs` table.
class FailedDelayedJob < ApplicationRecord
  self.table_name = 'failed_delayed_jobs'
end
