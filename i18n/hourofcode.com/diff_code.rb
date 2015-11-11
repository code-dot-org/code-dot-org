#! /usr/bin/env ruby
require 'tempfile'

# Returns a string describing the difference in the code blocks (<% ... %>) in
# the files at path 1 and path2
def diff_code(path1, path2)
  out1 = create_tempfile(strip_code(read_file(path1)))
  out2 = create_tempfile(strip_code(read_file(path2)))
  `diff #{out1.path} #{out2.path} -b | cat -t`
end

# Returns only the code enclosed in <% .. %> blocks in str.
def strip_code(str)
  result = ''
  str.scan(/<%.*?%>/m) do |match|
    result += match
  end
  result
end

# Returns the contents of the file at path.
def read_file(path)
  File.open(path) { |f| return f.read }
end

# Returns a tempfile containing str.
def create_tempfile(str)
  out = Tempfile.new('i18n')
  out.write(str)
  out.write("\n")
  out.flush
end

print diff_code(ARGV[0], ARGV[1])
