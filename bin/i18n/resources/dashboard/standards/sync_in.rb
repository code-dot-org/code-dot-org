#!/usr/bin/env ruby

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../standards'

module I18n
  module Resources
    module Dashboard
      module Standards
        class SyncIn < I18n::Utils::SyncInBase
          def process
            # Takes strings describing and naming Framework, StandardCategory, and Standard
            # and places them in the source pool to be sent to crowdin.
            Framework.select(:id, :name, :shortcode).find_each do |framework|
              framework_i18n_data = {
                'name' => framework.name,
                'categories' => {},
                'standards' => {},
              }

              StandardCategory.select(:id, :shortcode, :properties).where(framework: framework).find_each do |category|
                framework_i18n_data['categories'][category.shortcode] = {
                  'description' => category.description,
                }
              end

              Standard.select(:id, :shortcode, :description).where(framework: framework).find_each do |standard|
                framework_i18n_data['standards'][standard.shortcode] = {
                  'description' => standard.description,
                }
              end

              framework_i18n_source_file_path = File.join(I18N_SOURCE_DIR_PATH, "#{framework.shortcode}.json")
              I18nScriptUtils.write_json_file(framework_i18n_source_file_path, framework_i18n_data)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Standards::SyncIn.perform if __FILE__ == $0
