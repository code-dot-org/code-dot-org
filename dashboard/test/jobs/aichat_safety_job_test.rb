require "test_helper"

class AichatSafetyJobTest < ActiveJob::TestCase
  test "toxic prompt is not safe" do
    toxic_job = perform_enqueued_jobs do
      AichatSafetyJob.perform_later(prompt: "You are a trash person.")
    end
    assert_equal false, toxic_job.wait_for_results["safe"]
  end

  test "kind prompt is safe" do
    safe_job = perform_enqueued_jobs do
      AichatSafetyJob.perform_later(prompt: "I ❤️ those cookies you baked for me.")
    end
    assert_equal true, safe_job.wait_for_results["safe"]
  end
end
