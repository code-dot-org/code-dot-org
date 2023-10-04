require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'
require_relative '../dashboard'

module I18n
  module Resources
    module Dashboard
      module Scripts
        FILE_NAME = 'scripts.yml'.freeze
        ORIGIN_I18N_FILE_PATH = File.join(I18n::Resources::Dashboard::ORIGIN_I18N_DIR_PATH, 'scripts.en.yml')
        I18N_SOURCE_FILE_PATH = File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, FILE_NAME).freeze

        def self.sync_in
          puts 'Preparing dashboard scripts'
          FileUtils.mkdir_p(File.dirname(I18N_SOURCE_FILE_PATH))
          # `dashboard/config/locales/blocks.en.yml` updates automatically from levelbuilder content
          FileUtils.cp(ORIGIN_I18N_FILE_PATH, I18N_SOURCE_FILE_PATH)

          puts 'Redacting dashboard scripts'
          # Save the original data, for restoration
          original = I18N_SOURCE_FILE_PATH.sub('source', 'original')
          FileUtils.mkdir_p(File.dirname(original))
          FileUtils.cp(I18N_SOURCE_FILE_PATH, original)

          # Redact the specific subset of fields within each script that we care about.
          data = YAML.load_file(I18N_SOURCE_FILE_PATH)
          data['en']['data']['script']['name'].values.each do |datum|
            markdown_data = datum.slice('description', 'student_description', 'description_student', 'description_teacher')
            redacted_data = RedactRestoreUtils.redact_data(markdown_data, %w[resourceLink vocabularyDefinition], 'md')
            datum.merge!(redacted_data)
          end

          # Overwrite source file with redacted data
          File.write(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(data))
        end
      end
    end
  end
end
