#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../mobile'

module I18n
  module Resources
    module Pegasus
      module Mobile
        class SyncIn < I18n::Utils::SyncInBase
          ORIGINAL_I18N_FILE_PATH = File.join(ORIGIN_I18N_DIR_PATH, 'en-US.yml').freeze

          def process
            # TODO: fix `i18n/locales/source/pegasus/mobile.yml` instead of the original file `pegasus/cache/i18n/en-US.yml`
            I18nScriptUtils.fix_yml_file(ORIGINAL_I18N_FILE_PATH)
            I18nScriptUtils.copy_file(ORIGINAL_I18N_FILE_PATH, CDO.dir(I18N_SOURCE_DIR, DIR_NAME, FILE_NAME))
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncIn.perform if __FILE__ == $0
