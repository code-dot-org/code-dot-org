#!/usr/bin/env ruby

require 'csv'

class NewSoundAliasesMetadataBuilder
  def initialize(csv)
    @csv = CSV.parse(File.read(csv), headers: true)
  end

  def parse_filenames(csv)
    # csv_text = File.read(csv)
    # table = CSV.parse(File.read(csv), headers: true)
    filename = csv.by_col[1]
    # changed file extension to .mp3 to run .generateSoundMetaData.rb
    return filename.each do |name|
      name.gsub!(".wav", ".mp3")
    end
  end

  def parse_aliases(csv)
    # removed spaces to simplify
    # because csv file had aliases that had
    # more than one space or none
    aliases_with_spaces_removed = csv.by_col[3].each do |aliase|
      aliase.gsub!(/,\s+/, ',')
      aliase.tr!(" ", ',')
    end
    return aliases_with_spaces_removed.map do |aliase|
      "\"#{aliase.split(/\,/).join('\', \'').gsub!(/,\s+/, ',')}\""
    end
  end

  def create_json
    filename = parse_filenames(@csv)
    parsed_alises = parse_aliases(@csv)

    sound_hash = {}
    filename.zip(parsed_alises).each do |name, aliases|
      sound_hash[name.to_s] = aliases
    end

    dir_name = ARGV[0]

    sound_hash.each do |name, aliases|
      Dir["#{File.expand_path('~')}/Downloads/#{dir_name}/mp3_files/*"].each do |file_path|
        regex = /^#{name}$/
        if file_path.split('/')[-1].match(regex)
          aliases << ",\"category_#{dir_name.downcase}\""
          puts `./generateSoundMetadata.rb --aliases "#{aliases}" #{File.expand_path('~')}/Downloads/"#{dir_name}"/mp3_files/"#{name}"`
        end
      end
    end
  end
end

NewSoundAliasesMetadataBuilder.new('./sound_metadata.csv').create_json
