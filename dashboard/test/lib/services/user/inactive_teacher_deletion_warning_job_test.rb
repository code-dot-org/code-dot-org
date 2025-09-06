# frozen_string_literal: true

require 'test_helper'

class User::InactiveTeacherDeletionWarningJobTest < ActiveJob::TestCase
  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later}

    let(:teacher_email) {Faker::Internet.unique.email}
    let(:teacher_name) {Faker::Name.unique.name}
    let!(:teacher) {create(:teacher, email: teacher_email, name: teacher_name, current_sign_in_at: 48.months.ago)}

    let(:expect_teacher_warning_to_be_sent) do
      MailJet.expects(:send_email).with(
        :inactive_teacher_deletion_warning,
        teacher_email,
        teacher_name,
        vars: {first_name: teacher.given_name || teacher.name},
      )
    end

    let(:expect_event_logging) do
      Metrics::Events.expects(:log_event).with(
        event_name: 'inactive_teacher_deletion_warning',
        metadata: {
          teacher_id: teacher.id,
        },
      )
    end

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'enqueues job to "default" queue' do
      assert_enqueued_with(job: described_class, queue: 'default') do
        perform_later
      end
    end

    it 'send an email using MailJet with expected arguments' do
      expect_teacher_warning_to_be_sent.once
      perform_enqueued_jobs {perform_later}
    end

    it 'sets deletion_warning_email_sent_at' do
      perform_enqueued_jobs {perform_later}
      teacher.reload
      _(teacher.user_data_retention_status.deletion_warning_email_sent_at).wont_be_nil
    end

    it 'logs event' do
      expect_event_logging.once
      perform_enqueued_jobs {perform_later}
    end

    context 'when the first attempt raises TooManyRequests' do
      let(:exception) {RestClient::TooManyRequests}

      it 'it will try to send the email again' do
        expect_teacher_warning_to_be_sent.twice.raises(exception).then.returns(nil)
        perform_enqueued_jobs {perform_later}
      end
    end

    context 'when StandardError is raised' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        expect_teacher_warning_to_be_sent.raises(exception)
      end

      it 'rescues from exception with #report_exception' do
        described_class.any_instance.expects(:report_exception).with(exception).once
        perform_enqueued_jobs {perform_later}
      end
    end

    # We have legacy teacher accounts which don't have a plaintext email
    context 'teacher email is blank' do
      let(:teacher) {create(:teacher, :without_email, name: teacher_name)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        perform_enqueued_jobs {perform_later}
      end
    end
  end
end
