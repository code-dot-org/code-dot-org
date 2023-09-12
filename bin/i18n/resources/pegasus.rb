require 'fileutils'

require_relative '../i18n_script_utils'

Dir[File.expand_path('../pegasus/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      DIR_NAME = 'pegasus'
      I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, DIR_NAME)).freeze

      def self.sync_in
        HourOfCode.sync_in
        Markdown.sync_in

        # TODO: fix `i18n/locales/source/pegasus/mobile.yml` instead of the original file `pegasus/cache/i18n/en-US.yml`
        pegasus_i18n_file_path = CDO.dir('pegasus/cache/i18n/en-US.yml')
        I18nScriptUtils.fix_yml_file(pegasus_i18n_file_path)
        I18nScriptUtils.copy_file(pegasus_i18n_file_path, File.join(I18N_SOURCE_DIR_PATH, 'mobile.yml'))
      end

      def self.sync_out
        HourOfCode.sync_out
        Markdown.sync_out
      end
    end
  end
end
