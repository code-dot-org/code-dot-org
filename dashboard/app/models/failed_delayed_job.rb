# == Schema Information
#
# Table name: failed_delayed_jobs
#
#  id         :bigint           not null, primary key
#  priority   :integer          default(0), not null
#  attempts   :integer          default(0), not null
#  handler    :text(65535)      not null
#  last_error :text(16777215)
#  run_at     :datetime
#  locked_at  :datetime
#  failed_at  :datetime
#  locked_by  :string(255)
#  queue      :string(255)
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_failed_delayed_jobs_on_failed_at  (failed_at)
#
# This model represents a failed job that has been archived from the `delayed_jobs` table.
class FailedDelayedJob < ApplicationRecord
  self.table_name = 'failed_delayed_jobs'
end
