require 'fileutils'
require_relative '../metrics'

Dir[File.expand_path('../dashboard/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard')).freeze

      def self.sync_in
        FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)
        I18n::Metrics.report_runtime('Blocks', 'in') {Blocks.sync_in}
        I18n::Metrics.report_runtime('CourseContent', 'in') {CourseContent.sync_in}
        I18n::Metrics.report_runtime('CourseOfferings', 'in') {CourseOfferings.sync_in}
        I18n::Metrics.report_runtime('Courses', 'in') {Courses.sync_in}
        I18n::Metrics.report_runtime('CurriculumContent', 'in') {CurriculumContent.sync_in}
        I18n::Metrics.report_runtime('Docs', 'in') {Docs.sync_in}
        I18n::Metrics.report_runtime('Scripts', 'in') {Scripts.sync_in}
        I18n::Metrics.report_runtime('SharedFunctions', 'in') {SharedFunctions.sync_in}
        I18n::Metrics.report_runtime('Standards', 'in') {Standards.sync_in}

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
