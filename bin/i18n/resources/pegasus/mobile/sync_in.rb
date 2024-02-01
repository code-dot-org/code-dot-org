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
            # TODO: fix `i18n/locales/source/pegasus/mobile.yml` instead of the original file `pegasus/cache/i18n/en-US.yml`
            I18nScriptUtils.fix_yml_file(ORIGINAL_I18N_FILE_PATH)
            I18nScriptUtils.copy_file(ORIGINAL_I18N_FILE_PATH, I18N_SOURCE_FILE_PATH)
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncIn.perform if __FILE__ == $0
