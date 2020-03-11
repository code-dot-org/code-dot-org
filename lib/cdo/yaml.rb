require 'yaml'
require 'cdo/erb'
require 'cdo/pegasus/text_render'
#require 'dynamic_config/dcdo'

module Cdo
  # Extend YAML with customizations.
  module YAMLExtension
    def parse_yaml_header(content, locals={})
      match = content.match(/\A\s*^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
      return [{}, content] unless match

      # Implement new, TextRender-less parsing behind a DCDO flag so we can
      # verify it doesn't have any unexpected side effects before switching
      # over entirely.
      if DCDO.get('parse_yaml_header-manually', true)
        yaml = match[:yaml]
        yaml = ERB.new(yaml).result_with_hash(locals)
        [YAML.safe_load(yaml), match.post_match]
      else
        [TextRender.yaml(match[:yaml], locals), match.post_match]
      end
    end

    # Return +nil+ if file not found.
    def load_file(path)
      super
    rescue Errno::ENOENT
      nil
    end

    def load_erb_file(path, binding=nil)
      YAML.load(erb_file_to_string(path, binding), path)
    rescue Errno::ENOENT
      nil
    end
  end

  ::YAML.singleton_class.prepend YAMLExtension
end
