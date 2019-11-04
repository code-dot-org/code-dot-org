class Dayne
  def self.hello
    "hello"
  end

  def self.find(string_key)
    keys = string_key.split('.')
    results = []
    Dir.glob('../../dashboard/config/locales/*.yml').each do |path|
      lines = []
      File.open(path).each do |line|
        lines << line
      end
      current_keys = []
      lines.each_with_index do |line, index|
        # skip comments, empty lines, '---'
        if line =~ /\s*#/ || !line.include?(':')
            next
        end
        line_indent_size = get_indent_size(line)

        #skip the base language e.g. 'en', 'en-GB', etc
        if line_indent_size == 0
          next
        end

        current_keys = current_keys[0, (line_indent_size / 2) - 1]
        line = line.strip
        line_key_value = get_key_value(line)
        current_keys.push(line_key_value[:key])
        if current_keys == keys
          results << {index: index, value: line_key_value[:value].strip, path: path}
        end
      end
    end
    return results
  end

  # returns the number of white spaces from the start of the line to the first non-whitespace character
  def self.get_indent_size(s)
    s =~ /\S/
  end

  def self.get_key_value(yaml_line)
    first_colon_index = yaml_line =~ /:/
    # seperate the "key: value" string
    return {key: yaml_line[0..(first_colon_index - 1)], value: yaml_line[(first_colon_index + 1)..(-1)]}
  end

  def self.html_to_markdown(html)
    html = html.gsub /(<i>|<\/i>)/, '*'
  end

  #Dayne TODO delete this probably. I'm going to abandon copying the existing value.
  def self.copy_to_markdown(string_key, path)
    search_result = find(string_key, path)
    if !search_result
      return "unable to find key"
    end
    # add the _markdown suffic for the new key
    new_string_keys = string_key.split('.')
    new_string_keys[-1] = new_string_keys[-1] + "_markdown"

    lines = []
    File.open(path).each_with_index do |line, index|
      lines << line
      if index == search_result[:index]
        line_indent_size = get_indent_size(line)
        lines << "#{' ' * line_indent_size}#{new_string_keys[-1]}: #{search_result[:value]}\n"
      end
    end
    lines.join
  end
end

command, string_key, path = ARGV
case command
when 'find'
  Dayne.find(string_key).each do |result|
    puts "#{result[:path]}:#{result[:index]}:#{result[:value]}"
  end
when 'convert_to_markdown'
  puts (Dayne.find string_key, path)[:value]
  original = (Dayne.find string_key, path)[:value]
  markdown = Dayne.html_to_markdown original
  puts "original=#{original}"
  puts "markdown=#{markdown}"
else 
  puts "unrecognized command #{command}"
end
