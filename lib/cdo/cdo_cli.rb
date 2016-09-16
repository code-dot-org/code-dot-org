#
# Code.org command-line script utility methods
#
module CdoCli
  # Terminal style utilities for fashionable output
  def stylize(text, color_code)
    "\e[#{color_code}m#{text}\e[0m"
  end

  def bold(text); stylize(text, 1); end
  def dim(text); stylize(text, 2); end
  def underline(text); stylize(text, 4); end
end

# Utility to strip consistent leading whitespace from heredoc strings, allowing
# you to format your code more readably.
#
# Usage:
#   <<-DOC.unindent
#     Some text or other that I want to start in column 1.
#         An actually indented line.
#     This line still unindented.
#   DOC
#
# from http://stackoverflow.com/a/5638187/5000129
class String
  # Strip leading whitespace from each line that is the same as the
  # amount of whitespace on the least-indented line of the string.
  def unindent
    gsub /^#{scan(/^[ \t]+/).min_by(&:length)}/, ''
  end
end
