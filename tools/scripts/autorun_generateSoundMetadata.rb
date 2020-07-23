#!/usr/bin/env ruby

# FOR USE WHEN WORKING WITH MULTIPLE SOUND FILES IN A FOLDER
# FOR GENERATING METDATA FOR A SINGLE FILE THEN USE: generateSoundMetadata.rb

# Use this script for converting multiple audio formats into .mp3 (required)
# Then generateSoundMetadata.rb will be run to:
# 1. create metadata (JSON) for each file (required)
# 2. use file_path to get the directory name like animals or notifications
# to add category_animals or category_notifications to the aliases (required)

# This script assumes the csv will have columns of filenames and aliases.
# The csv that was used with the script had the filename in the 2nd column and aliases in the 4th column.

# command to run file: bundle exec ./autorun_generateSoundMetadata.rb [folder_path] [csv_path]
# example for folder_path = ~/Downloads/Animals
# example for csv_location = ./sound_metadata.csv
# example command = bundle exec ./parse_new_sound_aliases_csv.rb ~/Downloads/Animals ./sound_metadata.csv
require 'csv'
require 'fileutils'

class NewSoundAliasesMetadataBuilder
  CORRUPTED_FILENAME_REGEX = /(^\_+|\_+$|_{2,}|\s|[A-Z])/
  def initialize(csv)
    @csv = CSV.parse(File.read(csv), headers: true)
  end

  def fix_corrupted_filename(name)
    # some names have uppercases
    return name.downcase.tr(" ", "_").gsub(/_{2,}/, "_").gsub(/^\_+/, '').gsub(/\_+$/, '')
  end

  def convert_wav_to_mp3(folder_path)
    # converts .wav files to .mp3
    puts %x(
        for file in "#{folder_path}"/*.wav
        do \`ffmpeg -i "$file" "${file%.wav}".mp3\`
          done
      )
    Dir.mkdir "#{folder_path}/mp3_files"

    Dir[folder_path + "/*.mp3"].each do |f|
      filename = File.basename(f, File.extname(f))

      if filename =~ CORRUPTED_FILENAME_REGEX
        fixed_name = fix_corrupted_filename(filename)
        File.rename(f, folder_path + "/" + fixed_name + File.extname(f))
        f.gsub!(f.split('/')[-1], "#{fixed_name}.mp3")
      end

      FileUtils.mv(f.to_s, "#{folder_path}/mp3_files")
    end
  end

  def parse_filenames_in_csv(csv)
    filename = csv.by_col[1]
    # changed file extension to .mp3 to run .generateSoundMetaData.rb
    return filename.map do |name|
      # original file extensions are .wav but they shoud be .mp3
      # in order to run ./generateSoundMetaData.rb
      name = fix_corrupted_filename(name[0..-5])
      # require 'pry'; binding.pry
      name << ".mp3"
    end
  end

  def parse_aliases_in_csv(csv)
    # removed spaces to simplify
    # because csv file had aliases that had
    # more than one space or none
    return csv.by_col[3].map do |aliase|
      aliase.gsub(/,\s+/, ',').tr(" ", ',').gsub(/'',/, '').delete(".").downcase.gsub(/,{2,}/, ',').split(",").uniq.join(",")
    end
  end

  def create_json
    filenames = parse_filenames_in_csv(@csv)
    parsed_aliases = parse_aliases_in_csv(@csv)

    sound_hash = {}
    filenames.zip(parsed_aliases).each do |name, aliases|
      sound_hash[name.to_s] = aliases
    end

    folder_path = ARGV[0]
    convert_wav_to_mp3(folder_path)

    sound_hash.each do |name, aliases|
      Dir[folder_path + "/mp3_files/*"].each do |file_path|
        regex = /^#{name}$/

        if file_path.split('/')[-1].downcase =~ CORRUPTED_FILENAME_REGEX
          raise "#{file_path.split('/')[-1].downcase} is corrupted with space/multiple underscores"
        end

        next unless file_path.split('/')[-1].downcase.match(regex)
        raise "Aliase is corrupted with space/multiple commas/spaces/uppercase/dots: #{aliases}" if aliases =~ /(,{2,}|\s|[A-Z]|[.])/
        aliases << ",category_#{file_path.split('/')[-3].downcase},noResale"
        puts `./generateSoundMetadata.rb --aliases "#{aliases}" "#{file_path}"`
      end
    end
  end
end

NewSoundAliasesMetadataBuilder.new(ARGV[1].to_s).create_json
