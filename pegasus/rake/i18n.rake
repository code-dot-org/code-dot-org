require 'cdo/google_drive'

# Given a line of yml in the form of key: value, wraps unquoted strings in
# double quotes, escaping existing quotes. Does not touch already quoted or
# single quoted strings.
# We do this because, without quoting, the consumer of the YAML will mistake
# convertable[-to-boolean] values like yes/no true/false as booleans instead
# of treating them as strings.
def format_enus_yml_with_quotes(line)
  match_data = /^ +[a-zA-Z0-9_ ]+?: *(.+)$/.match(line)
  if match_data # formats the values
    unless /^(".*"|'.*'|\|.*)$/ =~ match_data[1]
      line.gsub!(/"/, '\\"')
      line.gsub!(/^([ a-zA-Z0-9_ ]+?): *(.*)$/, '\1: "\2"')
    end
  else # formats the first key
    line.gsub!(/^en-US:$/, '"en-US":')
  end

  return line
end

def hash_to_yml_with_quoted_values(hash, yml_path)
  buffer = StringIO.new(hash.to_yaml(line_width: -1))

  File.open(yml_path, 'wb') do |file|
    buffer.each_line do |line|
      next if line == "---\n"
      next if line.empty?
      file.write(format_enus_yml_with_quotes(line))
    end
  end
end

namespace :i18n do
  desc 'download the latest i18n gsheet'
  task :sync do
    gsheet = 'Data/I18n'
    path = pegasus_dir('cache/i18n/en-US.yml')

    file = gdrive.file(gsheet)
    raise("Google Drive file '#{gsheet}' not found.") unless file

    mtime = file.mtime
    ctime = File.mtime(path).utc if File.file?(path)
    unless mtime.to_s == ctime.to_s
      puts "gdrive #{path}"

      en_us = {}
      line = 1
      CSV.parse(file.spreadsheet_csv) do |row|
        en_us[row[0]] = row[1] unless line == 1
        line += 1
      end
      hash_to_yml_with_quoted_values({'en-US' => en_us}, path)
      File.utime(File.atime(path), mtime, path)
    end
  end
end
