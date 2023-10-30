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
          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
            return unless File.file?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              # Distributes the localization
              target_i18n_file_name = crowdin_file_name.gsub(/en.md/, "#{language[:locale_s]}.md")
              target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, target_i18n_file_name)
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
