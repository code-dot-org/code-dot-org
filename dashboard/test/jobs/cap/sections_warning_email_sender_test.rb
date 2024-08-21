require 'test_helper'

class CAP::SectionsWarningEmailSenderTest < ActiveJob::TestCase
  let(:described_class) {CAP::SectionsWarningEmailSender}

  describe '#perform_later' do
    let(:teacher) {create(:teacher, :with_cap_grace_period_section, :with_cap_locked_out_section, :with_cap_compliant_section)}
    let(:sections) {teacher.sections[..1]}
    let(:schedule_job) {described_class.perform_later(teacher_id: teacher.id, section_ids: sections.map(&:id))}

    it 'schedules the job on the queue' do
      assert_enqueued_with(job: described_class) do
        schedule_job
      end
    end

    it 'sends the email only to the CAP gated sections' do
      described_class.any_instance.expects(:send_warning_email).with(teacher, sections).once
      perform_enqueued_jobs do
        schedule_job
      end
    end

    it 'logs a CAP::UserEvent' do
      Services::ChildAccount::EventLogger.expects(:log_sections_warning_email_sent).with(teacher).once
      perform_enqueued_jobs do
        schedule_job
      end
    end

    it 'logs an event to Metrics::Events' do
      event_data = {
        user: teacher,
        event_name: 'CAP Sections Warning Email Sent',
        metadata: {
          'template' => :cap_section_warning.to_s,
        }
      }
      Metrics::Events.expects(:log_event).with(event_data).once
      perform_enqueued_jobs do
        schedule_job
      end
    end
    context 'when the teacher_id is nil' do
      let(:schedule_job) {described_class.perform_later(teacher_id: nil, section_ids: sections.map(&:id))}

      it 'does not send an email' do
        described_class.any_instance.expects(:send_warning_email).never
        perform_enqueued_jobs do
          schedule_job
        end
      end
    end

    context 'when section_ids is nil' do
      let(:schedule_job) {described_class.perform_later(teacher_id: teacher.id, section_ids: nil)}

      it 'does not send an email' do
        described_class.any_instance.expects(:send_warning_email).never
        perform_enqueued_jobs do
          schedule_job
        end
      end
    end

    context 'when the teacher_id is deleted' do
      let(:teacher) {create(:teacher, :deleted)}

      it 'does not send an email' do
        described_class.any_instance.expects(:send_warning_email).never
        perform_enqueued_jobs do
          schedule_job
        end
      end
    end

    context 'exception thrown' do
      let(:exception) {StandardError.new('expected_exception')}

      it 'reports exception to Honeybadger' do
        described_class.any_instance.stubs(:send_warning_email).with(teacher, sections).raises(exception)
        Honeybadger.expects(:notify).with(exception, anything).once
        perform_enqueued_jobs do
          assert_raises(exception.class) do
            schedule_job
          end
        end
      end
    end
  end
end
