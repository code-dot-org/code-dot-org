require_relative '../../populator'

class CdoSoundLibrary::HocSongMeta::Populate
  include Populator

  # The API path that maps to the bucket
  API_PATH = '/api/v1/sound-library/hoc_song_meta'

  TEST_MUSIC_URL = 'https://curriculum.code.org/media/uploads/synthesize.mp3'.freeze
  TEST_MUSIC_BPM = 110.0

  def ffmpeg?
    unless defined?(@ffmpeg)
      @ffmpeg = !!system('which ffmpeg > /dev/null')
    end

    @ffmpeg
  end

  def download_test_music
    to = local_path("synthesize.mp3")
    unless File.exist?(to)
      url = 'https://curriculum.code.org/media/uploads/synthesize.mp3'
      response = HTTParty.get(url)
      if response.code != 200
        puts "ERROR: Cannot find the given file"
        return
      end

      # Write out file
      relative_path = File.path(Pathname.new(to).relative_path_from(base_path))
      puts "Writing test music: #{bucket_name}:#{relative_path}"
      data = response.body
      File.open(to, 'w+') do |f|
        f.binmode
        f.write(data)
      end
    end

    to
  end

  # Hook into the populate call to produce the appropriate mp3 as well
  def populate(path = nil)
    data = super(path)

    unless path.nil? || path.include?('songManifest') || path.include?('testManifest')
      # This is song metadata so we want some song as well
      metadata = JSON.parse(data)
      song_path = metadata['file']
      file_name = File.basename(song_path)
      bpm = metadata['bpm'].to_f
      puts "Creating #{file_name} with #{bpm} bpm"

      # Download the 'synthesize' music file which is in 110 bpm
      test_music_path = download_test_music

      # If we have ffmpeg support, we can get the music to match
      # its metadata.
      if ffmpeg?
        # Get the expected delay in milliseoncds (the test music has no delay)
        delay = data['delay'].to_f * 1000

        # Get the relative speed as a percentage of the test music
        speed = bpm / TEST_MUSIC_BPM

        # These go in the 'restricted' bucket

        # Use ffmpeg to add delay and to speed up / slow down test music to match bpm
        #system("ffmpeg -i #{test_music_path} -af adelay=#{delay}|#{delay} #{file_name}.mp3")
        file_path = local_path("../../cdo_restricted/restricted/#{file_name}")

        dir_path = File.dirname(file_path)
        FileUtils.mkdir_p(dir_path)

        unless File.exist?(file_path)
          ffmpeg_command = "ffmpeg -i #{test_music_path} -af atempo=#{speed},adelay=\"#{delay}|#{delay}\" #{file_path}"
          system ffmpeg_command
        end
      else
        # Just use the test music at the wrong dimensions
        puts "WARN: No ffmpeg available! The sound files might not be in sync with metadata."
        file_path = test_music_path
      end

      # Ensure we write the audio data to the cdo-restricted bucket
      put('cdo-restricted', "restricted/#{file_name}", -> {File.read(file_path)})
    end

    data
  end

  def populate_all
    data = JSON.parse(populate("songManifest2024_v2.json"))

    # Write out the song metadata
    data["songs"].each do |info|
      id = info["id"]
      populate("#{id}.json")
    end
  end
end
