#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../musiclab_libraries'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths.push(
            *LIBRARY_NAME_IN_OUT_MAPPINGS.map {|name_map| CDO.dir(I18N_SOURCE_DIR, DIR_NAME, "#{name_map[:to]}.json")}
          )
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabLibraries::SyncUp.perform if __FILE__ == $0
