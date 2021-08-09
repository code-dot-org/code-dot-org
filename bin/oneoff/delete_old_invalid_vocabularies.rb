#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

def main(command=nil, *args)
  valid, invalid = Vocabulary.all.partition(&:valid?)
  puts "total Vocabulary objects: #{Vocabulary.all.count}"
  puts "    valid: #{valid.count}"
  puts "  invalid: #{invalid.count}"

  if invalid.empty?
    puts "No invalid objects no interact with"
    return
  end

  no_lessons = invalid.select {|v| v.lessons.empty?}
  puts "Of the invalid objects, #{no_lessons.count} of them are not associated with any lessons"
  return if no_lessons.empty?

  case command
  when "list"
    no_lessons.each do |vocab|
      puts "#{vocab.word.inspect} (#{vocab.key}): #{vocab.definition.inspect}"
    end
  when "destroy"
    no_lessons.each(&:destroy)
    puts "destroyed #{no_lessons.count} objects"
  else
    puts "run with 'list' to see all invalid vocabularies that are associated with no lesson"
    puts "run with 'destroy' to destroy invalid vocabularies that are associated with no lesson"
  end
end

main(*ARGV)
