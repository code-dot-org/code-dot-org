require 'fileutils'

Dir[File.expand_path('../dashboard/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard')).freeze

      def self.sync_in
        FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

        Blocks.sync_in
        CourseContent.sync_in
        CourseOfferings.sync_in
        Courses.sync_in
        CurriculumContent.sync_in
        Docs.sync_in
        Scripts.sync_in
        SharedFunctions.sync_in
        Standards.sync_in

        puts 'Copying Dashboard source files'
        # Special case the un-prefixed Yaml file.
        FileUtils.cp(CDO.dir('dashboard/config/locales/en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'base.yml'))
        # Copy in needed files from dashboard
        FileUtils.cp(CDO.dir('dashboard/config/locales/data.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'data.yml'))
        FileUtils.cp(CDO.dir('dashboard/config/locales/devise.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'devise.yml'))
        FileUtils.cp(CDO.dir('dashboard/config/locales/restricted.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'restricted.yml'))
        FileUtils.cp(CDO.dir('dashboard/config/locales/slides.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'slides.yml'))
        FileUtils.cp(CDO.dir('dashboard/config/locales/unplugged.en.yml'), File.join(I18N_SOURCE_DIR_PATH, 'unplugged.yml'))
      end
    end
  end
end
