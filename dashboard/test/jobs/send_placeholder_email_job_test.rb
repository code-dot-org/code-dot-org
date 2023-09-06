require "test_helper"

class SendPlaceholderEmailJobTest < ActiveJob::TestCase
  test "job sends placeholder email" do
    user = create :user
    PlaceholderMailer.expects(:placeholder_email).with(user).returns(
      mock {|mail| mail.stubs(:deliver_now)}
    )
    perform_enqueued_jobs do
      SendPlaceholderEmailJob.perform_later(user)
    end
  end
end
