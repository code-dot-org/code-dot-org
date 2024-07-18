#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
# require_relative '../animations'

module I18n
  module Resources
    module Apps
      module MusiclabManifests
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: 'musiclab_manifests')
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabManifests::SyncDown.perform if __FILE__ == $0
