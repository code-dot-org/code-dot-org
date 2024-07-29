#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../mobile'

module I18n
  module Resources
    module Pegasus
      module Mobile
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.crowdin_locale_dir(language[:locale_s], FILE_PATH)
            return unless File.file?(crowdin_file_path)

            pegasus_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "#{language[:locale_s]}.json")

            i18n_data = JSON.load_file(crowdin_file_path)
            I18nScriptUtils.sanitize_data_and_write({language[:locale_s] => i18n_data}, pegasus_i18n_file_path)

            I18nScriptUtils.move_file(crowdin_file_path, I18nScriptUtils.locale_dir(language[:locale_s], FILE_PATH))
            I18nScriptUtils.remove_empty_dir File.dirname(crowdin_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncOut.perform if __FILE__ == $0
