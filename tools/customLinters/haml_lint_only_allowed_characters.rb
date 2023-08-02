require_relative 'linter_constants'

module HamlLint
  # This linter ensures we are using consistent quotation mark
  # characters in our files by not allowing many characters.
  # See https://www.cl.cam.ac.uk/~mgk25/ucs/quotes.html for more discussion.
  class Linter::OnlyAllowedCharacters < Linter
    include LinterRegistry
    include LinterConstants

    def visit_root(root)
      dummy_node = Struct.new(:line)

      document.source_lines.each_with_index do |line, index|
        next unless line.match?(NOT_ALLOWED_REGEX)

        unless root.node_for_line(index).disabled?(self)
          record_lint dummy_node.new(index + 1), NOT_ALLOWED_MSG
        end
      end
    end
  end
end
