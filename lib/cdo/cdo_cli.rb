#
# Code.org command-line script utility methods
#
# Please keep this file's dependencies light - it's designed to be used in
# script utilities that themselves have very few dependencies so that they load
# and run very fast.  Thanks!
#
module CdoCli
  # Terminal style utilities for fashionable output
  def stylize(text, color_code)
    "\e[#{color_code}m#{text}\e[0m"
  end

  def bold(text)
    stylize(text, 1)
  end

  def dim(text)
    stylize(text, 2)
  end

  def underline(text)
    stylize(text, 4)
  end

  def red(text)
    stylize(text, 31)
  end
end

# Utility to strip consistent leading whitespace from heredoc strings, allowing
# you to format your code more readably.
#
# @example
#   <<-DOC.unindent
#     Some text or other that I want to start in column 1.
#         An actually indented line.
#     This line still unindented.
#   DOC
#
# from http://stackoverflow.com/a/9654275
class String
  # Strip leading whitespace from each line that is the same as the
  # amount of whitespace on the least-indented line of the string.
  def unindent
    indent = scan(/^[ \t]*(?=\S)/).min.size || 0
    gsub /^[ \t]{#{indent}}/, ''
  end

  # Strip leading whitespace from each line that is the same as the amount of
  # whitespace on the least-indented line of the string. Then indent the
  # resulting lines by num_start_spaces spaces.
  def unindent_with_indent(num_start_spaces)
    indent = scan(/^[ \t]*(?=\S)/).min.size || 0
    gsub /^[ \t]{#{indent}}/, ' ' * num_start_spaces
  end
end
