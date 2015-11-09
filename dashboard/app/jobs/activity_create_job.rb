# A async job worker for inserting Activity rows in bulk

require 'dynamic_config/dcdo'

class ActivityCreateJob
  include Shoryuken::Worker

  # Message format
  # --
  # user_id [Integer]
  # action [String]
  # test_result [Integer]
  # attempt [Integer]
  # lines [Integer]
  # time [Integer]
  # level_source_id [Integer]
  # created_at [DateTime]
  # updated_at [DateTime]

  shoryuken_options(
    batch: true,
    queue: CDO.activity_queue,
    auto_delete: true,
    body_parser: :json,
    rate_per_minute: lambda { DCDO.get('activity_create_rate', 1000000) }
  )

  def perform(sqs_msgs, hashes)
    # Note: These jobs should normally be idempotent
    # but the cost of verifying the work has not already been done
    # outweighs there very rarely being duplicate activity rows.
    Activity.create!(
      hashes
    )
  end
end
