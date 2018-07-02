require 'yaml'

module YAML
  def self.parse_yaml_header(content, locals={})
    match = content.match(/\A\s*^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
    return [{}, content] unless match
    [TextRender.yaml(match[:yaml], locals), match.post_match]
  end
end
