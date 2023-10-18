require_relative '../i18n_script_utils'

module I18n
  module Resources
    module Dashboard
      DIR_NAME = 'dashboard'.freeze
      ORIGIN_I18N_DIR_PATH = CDO.dir('dashboard/config/locales').freeze
      I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
      I18N_BACKUP_DIR_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME).freeze

      def self.sync_in
        BaseContent.sync_in
        Blocks.sync_in
        CourseContent.sync_in
        CourseOfferings.sync_in
        Courses.sync_in
        CurriculumContent.sync_in
        DataContent.sync_in
        DeviseContent.sync_in
        Docs.sync_in
        RestrictedContent.sync_in
        Scripts.sync_in
        SharedFunctions.sync_in
        Standards.sync_in
        MarketingAnnouncements.sync_in

        I18nScriptUtils.copy_file File.join(ORIGIN_I18N_DIR_PATH, 'slides.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'slides.yml')
        I18nScriptUtils.copy_file File.join(ORIGIN_I18N_DIR_PATH, 'unplugged.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'unplugged.yml')
      end

      def self.sync_out
        BaseContent.sync_out
        Blocks.sync_out
        CourseContent.sync_out
        CourseOfferings.sync_out
        Courses.sync_out
        CurriculumContent.sync_out
        DataContent.sync_out
        DeviseContent.sync_out
        Docs.sync_out
        MarketingAnnouncements.sync_out
        RestrictedContent.sync_out
        Scripts.sync_out
        SharedFunctions.sync_out
        Standards.sync_out
      end
    end
  end
end

Dir[File.expand_path('../dashboard/**/*.rb', __FILE__)].sort.each {|file| require file}
