#!/usr/bin/ruby

require 'yaml'
require 'json'

def export_without_merge(file_type, new_translation_path, prev_translation_path)
  # is this a new file being translated?
  if File.exist?(new_translation_path) && !File.exist?(prev_translation_path)
    FileUtils.copy(new_translation_path, prev_translation_path)
  end

  # Translation begins
  if file_type == 'yml'
    new_translation = YAML.load_file(new_translation_path)

    File.open(prev_translation_path, 'w+') do |f|
      f.write(new_translation.to_yaml)
    end
  else
    new_translation = JSON.parse(File.read(new_translation_path))

    File.open(prev_translation_path, 'w+') do |f|
      f.write(JSON.pretty_generate(new_translation))
    end
  end
end

export_without_merge(*ARGV) if __FILE__ == $0
