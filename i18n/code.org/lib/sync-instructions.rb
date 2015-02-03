#! /usr/bin/env ruby
require 'yaml'

def find_instruction(f)
  pattern = "\"instructions\": \""
  f.each_line do |line|
    if !(line.match(pattern)).nil? # does this level have an instruction?
      line.strip # then trim to only get the instruction string
      if line[-2,1] == ","
        line = line[21...-3]
      else
        line = line[21...-2]
      end
      return line
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
end
localize_instructions