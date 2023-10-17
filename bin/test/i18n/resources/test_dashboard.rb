require_relative '../../test_helper'
require_relative '../../../i18n/resources/dashboard'

describe I18n::Resources::Dashboard do
  describe '.sync_in' do
    it 'sync-in Dashboard resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Dashboard::Blocks.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CourseContent.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CourseOfferings.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Courses.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CurriculumContent.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Docs.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Scripts.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::SharedFunctions.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Standards.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::MarketingAnnouncements.expects(:sync_in).in_sequence(execution_sequence)

      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/en.yml'), CDO.dir('i18n/locales/source/dashboard/base.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/data.en.yml'), CDO.dir('i18n/locales/source/dashboard/data.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/devise.en.yml'), CDO.dir('i18n/locales/source/dashboard/devise.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/restricted.en.yml'), CDO.dir('i18n/locales/source/dashboard/restricted.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/slides.en.yml'), CDO.dir('i18n/locales/source/dashboard/slides.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('dashboard/config/locales/unplugged.en.yml'), CDO.dir('i18n/locales/source/dashboard/unplugged.yml')).in_sequence(execution_sequence)

      I18n::Resources::Dashboard.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Dashboard resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Dashboard::Blocks.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CourseContent.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CourseOfferings.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Courses.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::CurriculumContent.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::Docs.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard::MarketingAnnouncements.expects(:sync_out).in_sequence(execution_sequence)

      I18n::Resources::Dashboard.sync_out
    end
  end
end
