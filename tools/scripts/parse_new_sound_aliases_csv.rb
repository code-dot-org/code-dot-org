#!/usr/bin/env ruby

require 'csv'

class NewSoundAliasesMetadataBuilder
  def initialize(csv)
    @csv = CSV.parse(File.read(csv), headers: true)
  end

  def parseFilename(csv)
    # csv_text = File.read(csv)
    # table = CSV.parse(File.read(csv), headers: true)
    filename = csv.by_col[1]
    # changed file extension to .mp3 to run .generateSoundMetaData.rb
    return filename.each do |name|
      name.gsub!(".wav", ".mp3")
    end
  end

  def parseAliases(csv)
    # removed spaces to simplify
    # because csv file had aliases that had
    # more than one space or none
    aliases_with_spaces_removed = csv.by_col[3].each do |aliase|
      aliase.gsub!(/,\s+/, ',')
      aliase.gsub!(/ /, ',')
    end
    return parsed_alises = aliases_with_spaces_removed.map do |aliase|
      "\"#{aliase.split(/\,/).join("\", \"").gsub!(/,\s+/, ',')}\""
    end
  end

  def createJSON()
    filename = parseFilename(@csv)
    parsed_alises = parseAliases(@csv)
    
    sound_hash = {}
    filename.zip(parsed_alises).each do |name, aliases|
      sound_hash["#{name}"] = aliases
    end

    dir_name = ARGV[0]


    sound_hash.each do |filename, aliases|
      Dir["#{File.expand_path('~')}/Downloads/#{dir_name}/mp3_files/*"].each do |file_path|
        regex = /^#{filename}$/
        if file_path.split('/')[-1].match(regex)
          aliases << ",\"category_#{dir_name.downcase}\""
          puts `./generateSoundMetadata.rb --aliases "#{aliases}" #{File.expand_path('~')}/Downloads/"#{dir_name}"/mp3_files/"#{filename}"`
        end
      end
    end
  end
end

NewSoundAliasesMetadataBuilder.new('./sound_metadata.csv').createJSON()
