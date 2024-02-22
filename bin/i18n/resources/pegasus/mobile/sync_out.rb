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
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], FILE_PATH)
            return unless File.file?(crowdin_file_path)

            pegasus_i18n_file_poth = File.join(ORIGIN_I18N_DIR_PATH, "#{language[:locale_s]}.yml")
            I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, pegasus_i18n_file_poth)

            I18nScriptUtils.move_file(crowdin_file_path, I18nScriptUtils.locale_dir(language[:locale_s], FILE_PATH))
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncOut.perform if __FILE__ == $0
