#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../base_content'

module I18n
  module Resources
    module Dashboard
      module BaseContent
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: FILE_PATH)
        end
      end
    end
  end
end

I18n::Resources::Dashboard::BaseContent::SyncDown.perform if __FILE__ == $0
