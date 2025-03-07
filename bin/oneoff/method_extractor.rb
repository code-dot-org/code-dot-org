#!/usr/bin/env ruby

require 'csv'

class MethodExtractor
  def initialize(file_path)
    @file_path = file_path
    @methods = {instance_methods: [], class_methods: [], private_methods: []}
  end

  def extract_methods
    current_method = nil
    method_body = []

    File.readlines(@file_path).each do |line|
      if /private def /.match?(line)
        current_method = extract_method_name(line)
        @methods[:private_methods] << {name: current_method, body: method_body}
        method_body = []
      elsif /def self\./.match?(line)
        current_method = extract_method_name(line)
        @methods[:class_methods] << {name: current_method, body: method_body}
        method_body = []
      elsif /def /.match?(line)
        current_method = extract_method_name(line)
        @methods[:instance_methods] << {name: current_method, body: method_body}
        method_body = []
      else
        method_body << line if current_method
      end
    end
    @methods
  end

  def extract_method_name(line)
    # Match method names with optional ? or !
    line.match(/def (?:self\.)?(\w+[?!=]?)/)[1]
  end

  def infer_return_type(method_body)
    # Analyze the method body to infer the return type
    method_body.each do |line|
      case line
      when /true|false/
        return "Boolean"
      when /".*"|'.*'/
        return "String"
      when /\[.*\]/
        return "Array"
      when /\{.*\}/
        return "Hash"
      when /nil/
        return "Nil"
      when /new |create/
        return "Object"
      end
    end
    "Unknown"
  end

  def to_csv
    CSV.generate do |csv|
      csv << ["Type", "Method Name", "Return Type"]
      @methods[:instance_methods].each do |method|
        return_type = infer_return_type(method[:body])
        csv << ["Instance Method", method[:name], return_type]
      end
      @methods[:class_methods].each do |method|
        return_type = infer_return_type(method[:body])
        csv << ["Class Method", method[:name], return_type]
      end
      @methods[:private_methods].each do |method|
        return_type = infer_return_type(method[:body])
        csv << ["Private Method", method[:name], return_type]
      end
    end
  end
end

# Usage
if ARGV.length != 1
  puts "Usage: ruby method_extractor.rb <ruby_file_path>"
  exit
end

file_path = ARGV[0]
extractor = MethodExtractor.new(file_path)
extractor.extract_methods
puts extractor.to_csv
