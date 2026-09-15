# frozen_string_literal: true

require 'test_helper'

class MailjetDeliveryJobTest < ActiveJob::TestCase
  setup do
    MailJet.stubs(:send_email)
  end

  it 'inherits from ApplicationJob' do
    _(MailjetDeliveryJob.superclass).must_equal ::ApplicationJob
  end

  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later(template_name, contact_email, contact_name, vars: vars, locale: locale)}

    let(:template_name) {:expected_template_name}
    let(:contact_email) {'expected_contact_email'}
    let(:contact_name) {'expected_contact_name'}
    let(:vars) {{expected: 'vars'}}
    let(:locale) {'expected_locale'}

    it 'enqueues job to "mailjet" queue' do
      assert_enqueued_with(job: described_class, queue: 'mailjet') do
        perform_later
      end
    end

    it 'sends email via MailJet with expected arguments' do
      perform_enqueued_jobs do
        MailJet.
          expects(:send_email).
          with(template_name, contact_email, contact_name, vars: vars, locale: locale).
          once

        perform_later

        assert_performed_jobs 1
      end
    end

    context 'when RestClient::TooManyRequests is raised' do
      let(:exception) {RestClient::TooManyRequests.new}

      before do
        MailJet.stubs(:send_email).raises(exception)
      end

      it 'retries job up to 5 times' do
        perform_enqueued_jobs do
          assert_raises(exception.class) {perform_later}
          assert_performed_jobs 5
        end
      end

      context 'once' do
        before do
          MailJet.stubs(:send_email).raises(exception).then.returns(nil)
        end

        it 'retries job once' do
          perform_enqueued_jobs do
            perform_later
            assert_performed_jobs 2
          end
        end
      end
    end
  end
end
