#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../shared_functions'

module I18n
  module Resources
    module Dashboard
      module SharedFunctions
        class SyncIn < I18n::Utils::SyncInBase
          LEVEL_TYPES = %w[GamelabJr].freeze

          def process
            I18nScriptUtils.write_yaml_file(
              I18N_SOURCE_FILE_PATH,
              I18nScriptUtils.to_dashboard_i18n_data('en', 'shared_functions', shared_functions_i18n_data)
            )
          end

          private

          def shared_functions
            @shared_functions ||= SharedBlocklyFunction.where(level_type: LEVEL_TYPES)
          end

          def shared_functions_i18n_data
            shared_functions.select(:id, :name).find_each.each_with_object({}) do |shared_function, i18n_data|
              i18n_data[shared_function.name] = shared_function.name
            end.sort.to_h
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::SharedFunctions::SyncIn.perform if __FILE__ == $0
