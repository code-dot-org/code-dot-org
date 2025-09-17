#!/usr/bin/env ruby

require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../course_offerings'

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        class SyncIn < I18n::Utils::SyncInBase
          def process
            I18nScriptUtils.write_file(I18N_SOURCE_FILE_PATH, JSON.pretty_generate(i18n_data))
          end

          private def i18n_data
            Dir.glob(ORIGIN_I18N_FILE_PATH).each_with_object({}) do |file_path, i18n_data|
              course_offering = I18nScriptUtils.parse_file(file_path)
              i18n_data[course_offering['key']] = {
                'display_name' => course_offering['display_name'],
                'description' => course_offering['description']
              }.compact
            end.sort.to_h
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseOfferings::SyncIn.perform if __FILE__ == $0
