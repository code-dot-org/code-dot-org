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
            i18n_data = I18nScriptUtils.parse_file(ORIGINAL_I18N_FILE_PATH)
            if i18n_data && i18n_data['en-US']
              I18nScriptUtils.sanitize_data_and_write(i18n_data['en-US'], I18N_SOURCE_FILE_PATH)
            else
              # Handle the case where i18n_data is nil or does not contain 'en-US'
              handle_missing_or_invalid_data
            end
          end

          def handle_missing_or_invalid_data
            raise "Error: i18n data is missing or invalid"
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncIn.perform if __FILE__ == $0
