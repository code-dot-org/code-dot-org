#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../restricted_content'

module I18n
  module Resources
    module Dashboard
      module RestrictedContent
        class SyncDown < I18n::Utils::SyncDownBase
          config.crowdin_project = 'codeorg-restricted'
          config.download_paths << DownloadPath.new(crowdin_src: FILE_PATH)
        end
      end
    end
  end
end

I18n::Resources::Dashboard::RestrictedContent::SyncDown.perform if __FILE__ == $0
