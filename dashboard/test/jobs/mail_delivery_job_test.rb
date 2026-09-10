require 'test_helper'

class MailDeliveryJobTest < ActiveJob::TestCase
  it 'inherits from ActionMailer::MailDeliveryJob' do
    _(MailDeliveryJob.superclass).must_equal ActionMailer::MailDeliveryJob
  end

  it 'includes ActiveJobMetrics' do
    _(MailDeliveryJob.ancestors).must_include ActiveJobMetrics
  end

  it 'includes ActiveJobEnqueueRetry' do
    _(MailDeliveryJob.ancestors).must_include ActiveJobEnqueueRetry
  end
end
