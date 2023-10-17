require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module SharedFunctions
        FILE_NAME = 'shared_functions.yml'.freeze
        I18N_SOURCE_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, FILE_NAME).freeze

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
