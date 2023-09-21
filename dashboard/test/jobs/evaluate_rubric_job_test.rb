require "test_helper"

class EvaluateRubricJobTest < ActiveJob::TestCase
  test "job can be performed" do
    skip 'avoid aws access'
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later
    end
  end
end
