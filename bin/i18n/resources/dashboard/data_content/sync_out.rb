#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../data_content'

module I18n
  module Resources
    module Dashboard
      module DataContent
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
            return unless File.file?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              # Distributes the localization
              target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "data.#{language[:locale_s]}.yml")
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

I18n::Resources::Dashboard::DataContent::SyncOut.perform if __FILE__ == $0
