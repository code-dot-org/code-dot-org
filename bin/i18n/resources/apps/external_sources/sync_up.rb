#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << File.join(BLOCKLY_CORE_I18N_SOURCE_DIR, '**/*.{json,yml}')
          config.source_paths << File.join(I18N_SOURCE_DIR_PATH, '**/*.{json,yml}')
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncUp.perform if __FILE__ == $0
