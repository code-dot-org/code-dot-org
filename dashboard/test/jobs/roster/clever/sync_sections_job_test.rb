require 'test_helper'

class Roster::Clever::SyncSectionsJobTest < ActiveJob::TestCase
  subject(:described_class) {Roster::Clever::SyncSectionsJob}
  subject(:described_instance) {described_class.new}

  it 'inherits from ApplicationJob' do
    _(described_class.superclass).must_equal ::ApplicationJob
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(teacher_id: teacher.id)}

    let(:teacher) {create(:teacher, :with_clever_authentication_option)}
    let(:clever_section) {create(:section, :from_clever, teacher:)}
    let(:archived_clever_section) {create(:section, :from_clever, :archived, teacher:)}
    let(:email_section) {create(:section, teacher:)}

    before do
      Services::Roster::Clever::SectionSyncer.stubs(:call)
    end

    it 'syncs teacher`s visible Clever sections' do
      Services::Roster::Clever::SectionSyncer.expects(:call).with(teacher:, section: clever_section).once
      Services::Roster::Clever::SectionSyncer.expects(:call).with(teacher:, section: archived_clever_section).never
      Services::Roster::Clever::SectionSyncer.expects(:call).with(teacher:, section: email_section).never
      perform_job
    end

    context 'when something went wrong' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        described_instance.stubs(:perform).raises(exception)
      end

      it 'reports exception' do
        described_instance.expects(:report_exception).with(exception).once
        described_instance.perform_now
      end
    end
  end
end
