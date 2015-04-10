#! /usr/bin/env ruby
require 'yaml'
require 'tempfile'

def find_instruction(f)
  pattern = /^\s*"instructions": (".*?"),?\n$/
  f.each_line do |line|
    matches = line.match pattern
    if matches
      return matches.captures.first
    end
  end
  nil
end

def copy_instructions_to_yml(instructions)
  File.open("../../dashboard/config/locales/instructions.en.yml", "w+") do |f|
    f.write(({ "en" => { "data" => { "instructions" => instructions }}}).to_yaml)
    File.write(f, File.read(f))
  end
end

def reformat_quotes
  temp_file = Tempfile.new("tempinstructions.yml")
  File.open("../../dashboard/config/locales/instructions.en.yml", "r") do |f|
    f.each_line { |line| temp_file.puts line.gsub("'\"", '"').gsub("\"'", '"').gsub("''", "'")}
  end
  temp_file.close
  FileUtils.mv(temp_file.path, "../../dashboard/config/locales/instructions.en.yml")
end

def localize_instructions
  level_instructions = Hash.new

  Dir.glob("../../dashboard/config/scripts/levels/*.level").each do |file|
    level = File.basename(file, ".*" ) + "_instruction"

    File.open(file) do |f|
      instruction = find_instruction(f)
      if instruction
        level_instructions[level] = instruction
      end
    end
  end
  copy_instructions_to_yml(level_instructions)
  reformat_quotes
end
localize_instructions
