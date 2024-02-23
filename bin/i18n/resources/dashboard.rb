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
        MarketingAnnouncements.sync_in
        RestrictedContent.sync_in
        Scripts.sync_in
        SharedFunctions.sync_in
        Slides.sync_in
        Standards.sync_in
        UnpluggedContent.sync_in
      end

      def self.sync_up(**opts)
        BaseContent.sync_up(**opts)
        Blocks.sync_up(**opts)
        CourseContent.sync_up(**opts)
        CourseOfferings.sync_up(**opts)
        Courses.sync_up(**opts)
        CurriculumContent.sync_up(**opts)
        DataContent.sync_up(**opts)
        DeviseContent.sync_up(**opts)
        Docs.sync_up(**opts)
        MarketingAnnouncements.sync_up(**opts)
        RestrictedContent.sync_up(**opts)
        Scripts.sync_up(**opts)
        SharedFunctions.sync_up(**opts)
        Slides.sync_up(**opts)
        Standards.sync_up(**opts)
        UnpluggedContent.sync_up(**opts)
      end

      def self.sync_down(**opts)
        BaseContent.sync_down(**opts)
        Blocks.sync_down(**opts)
        CourseContent.sync_down(**opts)
        CourseOfferings.sync_down(**opts)
        Courses.sync_down(**opts)
        CurriculumContent.sync_down(**opts)
        DataContent.sync_down(**opts)
        DeviseContent.sync_down(**opts)
        Docs.sync_down(**opts)
        MarketingAnnouncements.sync_down(**opts)
        RestrictedContent.sync_down(**opts)
        Scripts.sync_down(**opts)
        SharedFunctions.sync_down(**opts)
        Slides.sync_down(**opts)
        Standards.sync_down(**opts)
        UnpluggedContent.sync_down(**opts)
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
        Slides.sync_out
        Standards.sync_out
        UnpluggedContent.sync_out

        # Should be called when all the Dashboard locale files have been synced-out
        TextToSpeech.sync_out
      end
    end
  end
end

Dir[File.expand_path('../dashboard/*.rb', __FILE__)].sort.each {|file| require file}
