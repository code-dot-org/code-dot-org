require "test_helper"

class EvaluateRubricJobTest < ActiveJob::TestCase
  test "job can be performed" do
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later
    end
  end
end
