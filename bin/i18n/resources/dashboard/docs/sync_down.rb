#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../docs'

module I18n
  module Resources
    module Dashboard
      module Docs
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: DIR_NAME)
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Docs::SyncDown.perform if __FILE__ == $0
