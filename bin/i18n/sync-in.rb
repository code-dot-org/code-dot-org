#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

Dir[File.expand_path('../resources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module SyncIn
    def self.perform
      puts "Sync in starting"
      I18n::Resources::Apps.sync_in
      I18n::Resources::Dashboard::CurriculumContent.sync_in
      I18n::Resources::Dashboard::CourseContent.sync_in
      I18n::Resources::Dashboard::Blocks.sync_in
      I18n::Resources::Dashboard::SharedFunctions.sync_in
      I18n::Resources::Dashboard::CourseOfferings.sync_in
      I18n::Resources::Dashboard::Standards.sync_in
      I18n::Resources::Dashboard::Docs.sync_in
      I18n::Resources::Dashboard::Scripts.sync_in
      I18n::Resources::Dashboard::Courses.sync_in
      I18n::Resources::Pegasus.sync_in
      puts "Copying source files"
      I18nScriptUtils.run_bash_script "bin/i18n-codeorg/in.sh"
      puts "Sync in completed successfully"
    rescue => exception
      puts "Sync in failed from the error: #{exception}"
      raise exception
    end
  end
end

I18n::SyncIn.perform if __FILE__ == $0
