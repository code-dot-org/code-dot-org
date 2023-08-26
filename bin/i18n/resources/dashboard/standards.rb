require 'fileutils'
require 'json'

require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Dashboard
      module Standards
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'standards')).freeze

        # Takes strings describing and naming Framework, StandardCategory, and Standard
        # and places them in the source pool to be sent to crowdin.
        def self.sync_in
          puts 'Preparing standards content'

          frameworks = {}

          # Localize all frameworks.
          Framework.find_each do |framework|
            frameworks[framework.shortcode] = {
              'name' => framework.name,
              'categories' => {},
              'standards' => {}
            }
          end

          # Localize all categories.
          StandardCategory.includes(:framework).find_each do |category|
            framework = category.framework

            categories = frameworks[framework.shortcode]['categories']
            categories[category.shortcode] = {
              'description' => category.description
            }
          end

          # Localize all standards.
          Standard.includes(:framework).find_each do |standard|
            framework = standard.framework

            standards = frameworks[framework.shortcode]['standards']
            standards[standard.shortcode] = {
              'description' => standard.description
            }
          end

          FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

          # Then, for each framework, generate a file for it.
          frameworks.each do |framework_name, data|
            File.write(File.join(I18N_SOURCE_DIR_PATH, "#{framework_name}.json"), JSON.pretty_generate(data))
          end
        end
      end
    end
  end
end
