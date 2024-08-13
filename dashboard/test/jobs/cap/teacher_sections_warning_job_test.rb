# frozen_string_literal: true

require 'test_helper'

class CAP::TeacherSectionsWarningJobTest < ActiveJob::TestCase
  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later}

    let(:cap_teacher_section_warning_emails) {['all']}

    let(:student_aga_gate_start_date) {30.days.ago}
    let(:teacher_email) {Faker::Internet.unique.email}
    let(:teacher_name) {Faker::Name.unique.name}
    let(:section_name) {Faker::Educator.unique.course_name}

    let(:teacher) {create(:teacher, email: teacher_email, name: teacher_name)}
    let(:section) {create(:section, user: teacher, name: section_name)}
    let(:student) {create(:cpa_non_compliant_student, :in_grace_period, cap_status_date: student_aga_gate_start_date)}

    let(:expect_teacher_warning_to_be_sent) do
      MailjetDeliveryJob.expects(:perform_later).with(
        :cap_section_warning,
        teacher_email,
        teacher_name,
        vars: {
          capSections: [
            Name: section_name,
            Link: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students"
          ],
        },
      )
    end

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      create(:follower, section: section, student_user: student)
    end

    before do
      MailjetDeliveryJob.stubs(:perform_later)
      DCDO.stubs(:get).with('cap_teacher_section_warning_emails', []).returns(cap_teacher_section_warning_emails)
    end

    it 'enqueues job to "default" queue' do
      assert_enqueued_with(job: described_class, queue: 'default') do
        perform_later
      end
    end

    it 'schedules warning email via MailjetDeliveryJob with expected arguments' do
      expect_teacher_warning_to_be_sent.once
      perform_enqueued_jobs {perform_later}
      assert_performed_jobs 1
    end

    context 'when StandardError is raised' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        expect_teacher_warning_to_be_sent.raises(exception)
      end

      it 'rescues from exception with #report_exception' do
        described_class.any_instance.expects(:report_exception).with(exception).once
        perform_enqueued_jobs {perform_later}
        assert_performed_jobs 1
      end
    end

    context 'when student is age-gated for more than 30 days' do
      let(:student_aga_gate_start_date) {30.days.ago - 1.second}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        perform_enqueued_jobs {perform_later}
        assert_performed_jobs 1
      end
    end

    context 'when student has parental permission' do
      let(:student) {create(:student, :with_parent_permission, cap_status_date: student_aga_gate_start_date)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        perform_enqueued_jobs {perform_later}
        assert_performed_jobs 1
      end
    end

    context 'when emails whitelist is empty' do
      let(:cap_teacher_section_warning_emails) {[]}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        perform_enqueued_jobs {perform_later}
        assert_performed_jobs 1
      end
    end

    context 'when teacher email is in whitelist' do
      let(:cap_teacher_section_warning_emails) {[teacher_email]}

      it 'schedules teacher warning email' do
        expect_teacher_warning_to_be_sent.once
        perform_enqueued_jobs {perform_later}
        assert_performed_jobs 1
      end
    end
  end
end
