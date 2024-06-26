#!/usr/bin/env ruby

# This script will copy, if necessary, the TTS (Text-To-Speech) mp3 files that we
# store in our cdo-tts bucket from their old locations that were based on a single
# MD5 hash to a new one which uses a more robust SHA-256 hash.
#
# We will do this to prevent the creation of thousands of duplicate recordings in
# the future due to new courses created from older versions of that course causing
# a massive run of TTS generation for the same content.
#
# There were a lot of dangling files that could not be re-mapped since their original
# strings do not seem to exist anymore. These files will not be copied since they
# cannot be rehashed. There is a risk that they will fail to exist, but this process
# in this script should exhaustively look at every single string to determine the
# existence of its TTS file.
#
# Also, there are many missing TTS files. Finding a few, and looking at them on our
# production site shows network errors as our app tries to load the TTS file. Our
# app assumes they exist and they do not, and we have no process for identifying or
# fixing this.
#
# With this in mind, I also want to record alongside the
# <locale>/<md5-hash>/<sha-hash>/<params>.mp3 a <params>.json file that contains
# metadata about the provenance of the TTS file which should include:
#   - text (string) -- The text being read by the agent.
#   - key (string) -- The source within the level for the text. (long_instructions, etc)
#   - level (string) -- The name of the level (replacing the old filename)
#
# Unfortunately, it is unclear how we would know that a TTS string was generated
# before in order to clean up the bucket. We could, however, go through every string,
# much like this script does, and find and clean up the dangling files. This script is
# not very complicated and this amount of complexity might be better than any other
# kind of bookkeeping.

puts "Starting migration of TTS files."
puts
puts "This will not overwrite content."
puts
puts "This will report updates on each line with the following keys preceding the operation:"
puts "[WRTE] - Creating a new file"
puts "[UPDT] - Updating an existing file"
puts "[COPY] - Copying an existing file to a new location"
puts "[EXST] - We see the file we want to make already exists... do nothing."

puts
puts "Loading app"

# Now go through all of our levels
require_relative 'dashboard/config/environment'

# The speed/shape are always the same
locales = TextToSpeech::VOICES.keys

KEYS = ['short_instructions', 'long_instructions', 'hint_markdown']

puts "Enumerating Levels"

found = {}
Level.all.each do |level|
  next unless level.published

  # For all strings, determine if they are saved in S3
  locales.each do |locale|
    I18n.locale = locale
    voice = TextToSpeech::VOICES[locale][:VOICE]
    speed = TextToSpeech::VOICES[locale][:SPEED]
    shape = TextToSpeech::VOICES[locale][:SHAPE]
    authored_hints = (level.respond_to?(:localized_authored_hints) ? level.localized_authored_hints : level.authored_hints)

    [
      level.tts_short_instructions_text,
      level.tts_long_instructions_text,
      *JSON.parse(authored_hints || "[]").map do |hint|
        TextToSpeech.sanitize(hint["hint_markdown"])
      end
    ].each_with_index do |text, i|
      next if text.strip.blank?
      md5_hash = Digest::MD5.hexdigest(text)
      sha_hash = Digest::SHA256.hexdigest(text)

      # The source for the text
      key_index = [i, 2].min
      key = KEYS[key_index]

      next if found.key?(md5_hash + '-' + voice)
      found[md5_hash + '-' + voice] = true
      path = "#{voice}/#{speed}/#{shape}/#{md5_hash}/#{level.name}.mp3"
      new_path = "#{locale}/#{md5_hash}/#{sha_hash}/#{voice}-#{speed}-#{shape}.mp3"

      if AWS::S3.exists_in_bucket(TTS_BUCKET, path)
        if AWS::S3.exists_in_bucket(TTS_BUCKET, new_path)
          puts "[EXST] #{path} -> #{new_path}"
        else
          puts "[COPY] #{path} -> #{new_path}"
          AWS::S3.create_client.copy_object(
            {
              bucket: TTS_BUCKET,
              copy_source: "/#{TTS_BUCKET}/#{path}",
              key: new_path,
            }
          )
        end

        # Create metadata for the copied file based on the info we have
        metadata_path = "#{new_path.rpartition('.').first}.json"
        metadata = {}
        if AWS::S3.exists_in_bucket(TTS_BUCKET, metadata_path)
          # Pull down the existing metadata
          metadata = JSON.parse(AWS::S3.download_from_bucket(TTS_BUCKET, metadata_path))
          puts "[UPDT] #{metadata_path}"
        else
          puts "[WRTE] #{metadata_path}"
        end
        metadata[level.name] = {
          key: key,
          locale: locale,
          text: text
        }
        AWS::S3.upload_to_bucket(TTS_BUCKET, metadata_path, metadata.to_json, no_random: true)
      else
        puts "[WARN] TTS file not found for level #{level.name} #{key} and locale #{locale}"
      end
    end
  end
end
