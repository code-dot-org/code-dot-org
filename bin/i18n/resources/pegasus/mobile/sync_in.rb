#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../mobile'

module I18n
  module Resources
    module Pegasus
      module Mobile
        class SyncIn < I18n::Utils::SyncInBase
          def process
            file_content = File.read(ORIGINAL_I18N_FILE_PATH)
            i18n_data = JSON.parse(file_content)
            I18nScriptUtils.sanitize_data_and_write(i18n_data['en-US'], I18N_SOURCE_FILE_PATH)
          rescue Errno::ENOENT => exception
            puts("File not found: #{ORIGINAL_I18N_FILE_PATH} - #{exception.message}")
            nil
          rescue JSON::ParserError => exception
            puts("JSON parsing error in file #{ORIGINAL_I18N_FILE_PATH} - #{exception.message}")
            nil
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncIn.perform if __FILE__ == $0
