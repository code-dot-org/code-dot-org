require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Pegasus
      module Markdown
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'markdown/public')).freeze

        def self.sync_in
          markdown_files_to_localize = %w[
            public/athome.md.partial
            public/break.md.partial
            public/coldplay.md.partial
            public/csforgood.md
            public/curriculum/unplugged.md.partial
            public/educate/csc.md.partial
            public/educate/curriculum/csf-transition-guide.md
            public/educate/it.md
            public/helloworld.md.partial
            public/hourofcode/artist.md.partial
            public/hourofcode/flappy.md.partial
            public/hourofcode/frozen.md.partial
            public/hourofcode/hourofcode.md.partial
            public/hourofcode/infinity.md.partial
            public/hourofcode/mc.md.partial
            public/hourofcode/playlab.md.partial
            public/hourofcode/starwars.md.partial
            public/hourofcode/unplugged-conditionals-with-cards.md.partial
            public/international/about.md.partial
            public/poetry.md.partial
            views/hoc2022_create_activities.md.partial
            views/hoc2022_play_activities.md.partial
            views/hoc2022_explore_activities.md.partial
          ]

          markdown_files_to_localize.each do |filepath|
            full_filepath = CDO.dir(File.join('pegasus/sites.v3/code.org', filepath))

            unless File.exist?(full_filepath)
              puts "#{filepath} does not exist"
              next
            end

            # Remove the .partial if it exists
            source_path = File.join(I18N_SOURCE_DIR_PATH, File.dirname(filepath), File.basename(filepath, '.partial'))
            # TODO: refactor dir structure
            source_path = source_path.sub('public/public/', 'public/')

            FileUtils.mkdir_p(File.dirname(source_path))
            FileUtils.cp(full_filepath, source_path)

            header, content, _line = Documents.new.helpers.parse_yaml_header(source_path)

            sanitized_header = I18nScriptUtils.sanitize_markdown_header(header)
            I18nScriptUtils.write_markdown_with_header(content, sanitized_header, source_path)
          end
        end
      end
    end
  end
end
