# This class downloads and processes a YouTube video by ID,
# making it available for viewing through Code.org's fallback video player.

# Dependency requirements:
# viddl-rb (`gem install viddl-rb`) - for downloading the video
# ffmpeg (`brew install ffmpeg` / `apt-get install ffmpeg`) - for transcoding local videos
# s3_access_key_id and s3_secret_access_key defined (e.g. in `locals.yml`)

require 'cdo/aws/s3'
require 'tmpdir'
require 'open-uri'

class Youtube

  VIDEO_BUCKET = 'videos.code.org'

  # Process a video with a youtube identifier.
  # If filename is provided, transcode the local file with ffmpeg.
  # If no filename is provided, download the transcoded video from YouTube.
  #
  # When downloading from YouTube, an HTTP head request will first check the absence of the file.
  # If `force`==true, the head request will be skipped.
  def self.process(id, filename=nil, force=false)
    if filename.nil? && !force
      require 'httparty'
      thumbnail_url = "https://#{VIDEO_BUCKET}/youtube/#{id}.jpg"
      response = HTTParty.head(thumbnail_url).response
      if response.is_a? ::Net::HTTPSuccess
        puts "Video id: #{id} already processed"
        return
      end
    end

    Dir.mktmpdir do |dir|
      if filename
        # Run ffmpeg to transcode local file
        output_file = "#{dir}/#{id}.mp4"
        cmd = "ffmpeg -i #{filename} #{%w(
          -acodec aac
          -strict experimental
          -ac 2
          -ab 128k
          -vcodec libx264
          -preset slow
          -f mp4
          -crf 22
          -s 640x360
        ).join(' ')} #{output_file}"
      else
        # Run viddl-rb to download transcoded video from youtube
        url = "https://www.youtube.com/watch?v=#{id}"
        cmd = "viddl-rb #{url} -s #{dir} -q 640:360:mp4"
      end

      IO.popen(cmd) { |output| output.each { |line| puts line } }
      file = Dir.glob("#{dir}/*").first
      raise RuntimeError, 'Video not available in correct format' if File.extname(file) != '.mp4'
      video_filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.mp4", File.open(file), access: :public_read, no_random: true, content_type: 'video/mp4')
      puts "https://#{VIDEO_BUCKET}/#{video_filename}"
      thumbnail_file = "https://i.ytimg.com/vi/#{id}/0.jpg"
      thumbnail = open(thumbnail_file) || raise(RuntimeError, 'Could not retrieve thumbnail for video')
      thumbnail_filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.jpg", thumbnail, access: :public_read, no_random: true)
      puts "https://#{VIDEO_BUCKET}/#{thumbnail_filename}"
    end
  end
end
