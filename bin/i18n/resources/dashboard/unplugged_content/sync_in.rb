#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../unplugged_content'

module I18n
  module Resources
    module Dashboard
      module UnpluggedContent
        class SyncIn < I18n::Utils::SyncInBase
          def process
            I18nScriptUtils.copy_file(ORIGIN_I18N_FILE_PATH, I18N_SOURCE_FILE_PATH)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::UnpluggedContent::SyncIn.perform if __FILE__ == $0
