#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../standards'

module I18n
  module Resources
    module Dashboard
      module Standards
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: DIR_NAME)
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Standards::SyncDown.perform if __FILE__ == $0
