require 'fileutils'

require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'hourofcode')).freeze

        # Pulls in all strings that need to be translated for HourOfCode.com. Pulls
        # source files from pegasus/sites.v3/hourofcode.com and collects them to a
        # single source folder i18n/locales/source.
        def self.sync_in
          puts 'Preparing Hour of Code content'

          orig_dir = CDO.dir('pegasus/sites.v3/hourofcode.com/public')

          # Copy the file containing developer-added strings
          FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)
          FileUtils.cp(CDO.dir('pegasus/sites.v3/hourofcode.com/i18n/en.yml'), I18N_SOURCE_DIR_PATH)

          # Copy the markdown files representing individual page content
          Dir[File.join(orig_dir, '**/*.{md,md.partial}')].each do |file|
            dest = file.sub(orig_dir, I18N_SOURCE_DIR_PATH)

            if File.extname(dest) == '.partial'
              dest = File.join(File.dirname(dest), File.basename(dest, '.partial'))
            end

            FileUtils.mkdir_p(File.dirname(dest))
            FileUtils.cp(file, dest)

            # YAML headers can include a lot of things we don't want translators to mess
            # with or worry about; layout, navigation settings, social media tags, etc.
            # However, they also include things like page titles that we DO want
            # translators to be able to translate, so we can't ignore them completely.
            # Instead, here we reduce the headers down to contain only the keys we care
            # about and then in the out step we reinflate the received headers with the
            # values from the original source.
            header, content, _line = Documents.new.helpers.parse_yaml_header(dest)
            I18nScriptUtils.sanitize_header!(header)
            I18nScriptUtils.write_markdown_with_header(content, header, dest)
          end
        end
      end
    end
  end
end
