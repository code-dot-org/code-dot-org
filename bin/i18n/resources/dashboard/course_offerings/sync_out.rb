#!/usr/bin/env ruby

require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../course_offerings'

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale_dir = I18nScriptUtils.locale_dir(pegasus_lang[:crowdin_name_s])
              crowdin_file_path = File.join(crowdin_locale_dir, DIR_NAME, FILE_NAME)
              next unless File.exist?(crowdin_file_path)

              locale = pegasus_lang[:locale_s]
              distribute_localization(locale, crowdin_file_path) unless locale == 'en-US'

              I18nScriptUtils.move_file(crowdin_file_path, I18nScriptUtils.locale_dir(locale, DIR_NAME, FILE_NAME))
            ensure
              I18nScriptUtils.remove_empty_dir(crowdin_locale_dir)

              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          private

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Dashboard/course_offerings sync-out',
              total: pegasus_languages.size
            )
          end

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def distribute_localization(locale, crowdin_file_path)
            crowdin_translations = JSON.load_file(crowdin_file_path)

            i18n_data = I18nScriptUtils.wrap_dashboard_i18n_data(locale, 'course_offerings', crowdin_translations)
            target_i18n_file_path = CDO.dir('dashboard/config/locales', "course_offerings.#{locale}.json")

            I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseOfferings::SyncOut.perform if __FILE__ == $0
