require 'yaml'

module Cdo
  # Extend YAML with customizations.
  module YAML
    def parse_yaml_header(content, locals={})
      match = content.match(/\A\s*^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
      return [{}, content] unless match
      [TextRender.yaml(match[:yaml], locals), match.post_match]
    end

    # Return +nil+ if file not found.
    def load_file(path)
      super
    rescue Errno::ENOENT
      nil
    end
  end

  ::YAML.singleton_class.prepend YAML
end
