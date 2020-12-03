require 'redcarpet'

module Redcarpet
  module Render
    class Inline < HTML
      # Override block-level methods to always just return their content as a
      # string (no markup)
      %w(
        block_code
        block_quote
        footnote_def
        footnotes
        header
        hrule
        list
        list_item
        paragraph
        table
        table_cell
        table_row
      ).each do |method|
        define_method method do |*args|
          args.first
        end
      end
    end
  end
end
