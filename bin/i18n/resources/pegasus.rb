require 'fileutils'

require_relative '../i18n_script_utils'

Dir[File.expand_path('../pegasus/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'pegasus')).freeze

      def self.sync_in
        HourOfCode.sync_in
        Markdown.sync_in

        puts 'Copying Pegasus source file'
        FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)
        # TODO: fix `i18n/locales/source/pegasus/mobile.yml` instead of the original file `pegasus/cache/i18n/en-US.yml`
        pegasus_i18n_file_path = CDO.dir('pegasus/cache/i18n/en-US.yml')
        I18nScriptUtils.fix_yml_file(pegasus_i18n_file_path)
        FileUtils.cp(pegasus_i18n_file_path, File.join(I18N_SOURCE_DIR_PATH, 'mobile.yml'))
      end
    end
  end
end
