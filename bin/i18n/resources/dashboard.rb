require 'fileutils'

Dir[File.expand_path('../dashboard/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard')).freeze
      DASHBOARD_CONFIG_PATH = CDO.dir('dashboard/config').freeze

      def self.sync_in
        Blocks.sync_in
        CourseContent.sync_in
        CourseOfferings.sync_in
        Courses.sync_in
        CurriculumContent.sync_in
        Docs.sync_in
        Scripts.sync_in
        SharedFunctions.sync_in
        Standards.sync_in

        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'base.yml')
        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/data.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'data.yml')
        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/devise.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'devise.yml')
        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/restricted.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'restricted.yml')
        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/slides.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'slides.yml')
        I18nScriptUtils.copy_file CDO.dir('dashboard/config/locales/unplugged.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'unplugged.yml')
      end

      def self.sync_out
        Blocks.sync_out
        CourseContent.sync_out
        CourseOfferings.sync_out
      end
    end
  end
end
