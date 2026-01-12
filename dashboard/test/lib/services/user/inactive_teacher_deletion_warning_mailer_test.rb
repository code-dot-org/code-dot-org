# frozen_string_literal: true

require 'test_helper'

class User::InactiveTeacherDeletionWarningMailerTest < ActiveJob::TestCase
  subject(:described_class) {InactiveTeacherDeletionWarningMailer}
  subject(:described_instance) {described_class.new(dry_run: dry_run, limit: limit)}
  let(:dry_run) {false}
  let(:limit) {nil}

  let(:teacher_email) {Faker::Internet.unique.email}
  let(:teacher_name) {Faker::Name.unique.name}
  let!(:teacher) {create(:teacher, email: teacher_email, name: teacher_name, current_sign_in_at: 48.months.ago, user_data_retention_status: create(:user_data_retention_status))}

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
      event_name: 'inactive_teacher_deletion_warning_sent',
      metadata: {
        teacher_id: teacher.id,
      },
    )
  end

  around do |test|
    Timecop.freeze {test.call}
  end

  describe '#call' do
    subject(:send_warning_emails) {described_instance.call}
    it 'sends an email using MailJet with expected arguments' do
      expect_teacher_warning_to_be_sent.once
      send_warning_emails
    end

    it 'sets deletion_warning_email_sent_at' do
      send_warning_emails
      teacher.reload
      _(teacher.user_data_retention_status.deletion_warning_email_sent_at).wont_be_nil
    end

    it 'increments num_teachers_warned' do
      send_warning_emails
      _(described_instance.send(:num_teachers_warned)).must_equal 1
    end

    it 'resends a deletion warning email if inactivity and last warning both exceed 3 years' do
      teacher.user_data_retention_status.update!(deletion_warning_email_sent_at: 42.months.ago)
      expect_teacher_warning_to_be_sent.once
      send_warning_emails
    end

    it 'does not send a deletion warning email if last warning does not exceed 41 months' do
      teacher.user_data_retention_status.update!(deletion_warning_email_sent_at: 40.months.ago)
      expect_teacher_warning_to_be_sent.never
      send_warning_emails
    end

    it 'logs event' do
      expect_event_logging.once
      send_warning_emails
    end

    context 'when the first attempt raises TooManyRequests' do
      let(:exception) {RestClient::TooManyRequests}

      it 'it will try to send the email again' do
        expect_teacher_warning_to_be_sent.twice.raises(exception).then.returns(nil)
        send_warning_emails
      end
    end

    context 'when StandardError is raised' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        expect_teacher_warning_to_be_sent.raises(exception)
      end

      it 'rescues the exception and increments num_errors' do
        send_warning_emails
        _(described_instance.send(:num_errors)).must_equal 1
      end
    end

    # We have legacy teacher accounts which don't have a plaintext email
    context 'teacher email is blank' do
      let(:teacher) {create(:teacher, :without_email, name: teacher_name)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        send_warning_emails
      end
    end

    context 'when teacher email is internal' do
      let(:teacher) {create(:teacher, email: 'teacher@code.org', name: teacher_name)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        send_warning_emails
      end

      it 'does not increment num_teachers_warned' do
        send_warning_emails
        _(described_instance.send(:num_teachers_warned)).must_equal 0
      end
    end

    context 'when dry run' do
      let(:dry_run) {true}
      it 'does not send emails in dry run mode' do
        expect_teacher_warning_to_be_sent.never
        send_warning_emails
      end
    end
  end

  describe '#inactive_teachers' do
    subject(:described_instance) {described_class.new}
    let(:inactive_teachers) {described_instance.send(:inactive_teachers)}
    let(:inactive_since) {42.months.ago}
    it 'returns inactive users who have not been sent deletion warning email' do
      expected_user = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status))
      _(inactive_teachers).must_include expected_user
    end

    it 'returns inactive users who have been sent deletion warning email more than 40 months ago' do
      expected_user = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status))
      expected_user.user_data_retention_status.update!(deletion_warning_email_sent_at: 42.months.ago)
      _(inactive_teachers).must_include expected_user
    end

    it 'does not return inactive user who has been sent deletion warning email less than 40 months ago' do
      expected_user = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status))
      expected_user.user_data_retention_status.update!(deletion_warning_email_sent_at: 40.months.ago)
      _(inactive_teachers).wont_include expected_user
    end

    it 'does not include accounts from processed_teacher_ids' do
      user = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status))
      described_instance.processed_teacher_ids << user.id
      _(inactive_teachers).wont_include user
    end
  end
end
