#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: BLOCKLY_CORE_DIR_NAME)
          config.download_paths << DownloadPath.new(crowdin_src: DIR_NAME)
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncDown.perform if __FILE__ == $0
