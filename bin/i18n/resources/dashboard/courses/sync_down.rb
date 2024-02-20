#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../courses'

module I18n
  module Resources
    module Dashboard
      module Courses
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: FILE_PATH)
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Courses::SyncDown.perform if __FILE__ == $0
