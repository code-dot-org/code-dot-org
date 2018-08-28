#!/usr/bin/env ruby

def fix_newlines(text)
  return text unless text.include?("<xml>")

  # There are two kinds of xml newline violation we want to be able to fix:
  #
  # The first is double newlines within xml:
  #
  #     Starting paragraph
  #
  #     <xml>
  #       <block/>
  #
  #       <block/>
  #     </xml>
  #
  #     Ending paragraph
  #
  # There should never be double newlines within xml.
  #
  #
  # Second is insufficient newlines around xml:
  #
  #     Starting paragraph
  #     <xml>
  #       <block/>
  #       <block/>
  #     </xml>
  #     Ending paragraph
  #
  # XML should always be fully separated from other blocks.
  #
  #
  # Both above examples should always be converted to:
  #
  #     Starting paragraph
  #
  #     <xml>
  #       <block/>
  #       <block/>
  #     </xml>
  #
  #     Ending paragraph
  #
  #
  # Note also that we need to address both of these issues for both the case
  # where newlines are represented as "\n" and where they are "\r\n". We don't
  # need to account for just "\r" or "\n\r", because as far as I'm aware these
  # formations do not occur in our system.

  start_index = 0
  while start_index < text.length
    start_index = text.index "<xml>", start_index
    break unless start_index
    end_index = text.index "</xml>", start_index

    double_newlines = text.index "\n\n", start_index
    if double_newlines && double_newlines < end_index
      text.slice!(double_newlines)
      end_index -= 1
    end

    quad_newlines = text.index "\r\n\r\n", start_index
    if quad_newlines && quad_newlines < end_index
      text.slice!(quad_newlines)
      text.slice!(quad_newlines)
      end_index -= 2
    end

    if start_index >= 4 && text[start_index - 2, 2] == "\r\n"
      if text[start_index - 4, 2] != "\r\n"
        text.insert(start_index, "\r\n")
        end_index += 2
      end
    elsif start_index >= 2 && text[start_index - 1] == "\n"
      if text[start_index - 2] != "\n"
        text.insert(start_index, "\n")
        end_index += 1
      end
    end

    after_end = end_index + 6
    if after_end < (text.length - 4) && text[after_end, 2] == "\r\n"
      if text[after_end + 2, 2] != "\r\n"
        text.insert(after_end, "\r\n")
        end_index += 2
      end
    elsif after_end < (text.length - 2) && text[after_end] == "\n"
      if text[after_end + 1] != "\n"
        text.insert(after_end, "\n")
        end_index += 1
      end
    end

    start_index = end_index
  end

  text
end

require_relative '../../dashboard/config/environment'
Level.all.each do |level|
  if level.try(:instructions)
    level.instructions = fix_newlines level.instructions
  end

  if level.try(:markdown_instructions)
    level.markdown_instructions = fix_newlines level.markdown_instructions
  end

  if level.try(:authored_hints)
    hints = JSON.parse(level.authored_hints)
    changed = false
    hints.each do |hint|
      new_markdown = fix_newlines hint["hint_markdown"].dup
      if new_markdown != hint["hint_markdown"]
        changed = true
        hint["hint_markdown"] = new_markdown
      end
    end
    level.authored_hints = JSON.dump(hints) if changed
  end

  level.write_custom_level_file
end
