#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/pegasus_markdown'
require_relative '../emails'

module I18n
  module Resources
    module Pegasus
      module Emails
        class SyncOut < I18n::Utils::SyncOutBase
          DIR_NAME = 'emails'.freeze

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale_dir = I18nScriptUtils.locale_dir(pegasus_lang[:crowdin_name_s])
              crowdin_locale_resource_dir = File.join(crowdin_locale_dir, DIR_NAME)
              next unless File.directory?(crowdin_locale_resource_dir)

              locale = pegasus_lang[:locale_s]
              distribute(locale, crowdin_locale_resource_dir) unless locale == 'en-US'

              FileUtils.rm_r(crowdin_locale_resource_dir)
            ensure
              I18nScriptUtils.remove_empty_dir(crowdin_locale_dir)

              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
            return unless File.file?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              # Distributes the localization
              target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "#{language[:locale_s]}.yml")
              I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, target_i18n_file_path)
            end

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME, FILE_NAME)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Emails::SyncOut.perform if __FILE__ == $0
