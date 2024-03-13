require_relative '../../test_helper'
require_relative '../../../i18n/resources/dashboard'

describe I18n::Resources::Dashboard do
  let(:described_class) {I18n::Resources::Dashboard}

  describe '.sync_in' do
    it 'sync-in Dashboard resources' do
      execution_sequence = sequence('execution')

      described_class::BaseContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Blocks.expects(:sync_in).in_sequence(execution_sequence)
      described_class::CourseContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::CourseOfferings.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Courses.expects(:sync_in).in_sequence(execution_sequence)
      described_class::CurriculumContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::DataContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::DeviseContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Docs.expects(:sync_in).in_sequence(execution_sequence)
      described_class::MarketingAnnouncements.expects(:sync_in).in_sequence(execution_sequence)
      described_class::RestrictedContent.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Scripts.expects(:sync_in).in_sequence(execution_sequence)
      described_class::SharedFunctions.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Slides.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Standards.expects(:sync_in).in_sequence(execution_sequence)
      described_class::UnpluggedContent.expects(:sync_in).in_sequence(execution_sequence)

      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up Dashboard resources' do
      execution_sequence = sequence('execution')

      described_class::BaseContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Blocks.expects(:sync_up).in_sequence(execution_sequence)
      described_class::CourseContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::CourseOfferings.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Courses.expects(:sync_up).in_sequence(execution_sequence)
      described_class::CurriculumContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::DataContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::DeviseContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Docs.expects(:sync_up).in_sequence(execution_sequence)
      described_class::MarketingAnnouncements.expects(:sync_up).in_sequence(execution_sequence)
      described_class::RestrictedContent.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Scripts.expects(:sync_up).in_sequence(execution_sequence)
      described_class::SharedFunctions.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Slides.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Standards.expects(:sync_up).in_sequence(execution_sequence)
      described_class::UnpluggedContent.expects(:sync_up).in_sequence(execution_sequence)

      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out Dashboard resources' do
      execution_sequence = sequence('execution')

      described_class::BaseContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Blocks.expects(:sync_out).in_sequence(execution_sequence)
      described_class::CourseContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::CourseOfferings.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Courses.expects(:sync_out).in_sequence(execution_sequence)
      described_class::CurriculumContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::DataContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::DeviseContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Docs.expects(:sync_out).in_sequence(execution_sequence)
      described_class::MarketingAnnouncements.expects(:sync_out).in_sequence(execution_sequence)
      described_class::RestrictedContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Scripts.expects(:sync_out).in_sequence(execution_sequence)
      described_class::SharedFunctions.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Slides.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Standards.expects(:sync_out).in_sequence(execution_sequence)
      described_class::UnpluggedContent.expects(:sync_out).in_sequence(execution_sequence)
      described_class::TextToSpeech.expects(:sync_out).in_sequence(execution_sequence)

      described_class.sync_out
    end
  end
end
