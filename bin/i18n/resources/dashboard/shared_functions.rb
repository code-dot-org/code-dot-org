require 'json'

require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Dashboard
      module SharedFunctions
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard/shared_functions.yml')).freeze

        def self.sync_in
          puts 'Preparing shared functions'

          # TODO: Refactor shared_functions request and data collection
          #   1. Select data in batches of 1k records
          #   2. Optimize data collection
          shared_functions = SharedBlocklyFunction.where(level_type: 'GamelabJr').pluck(:name)
          hash = {}
          shared_functions.sort.each do |func|
            hash[func] = func
          end

          File.write(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml({'en' => {'data' => {'shared_functions' => hash}}}))
        end
      end
    end
  end
end
