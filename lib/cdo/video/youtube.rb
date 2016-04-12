# This class downloads and processes a YouTube video by ID,
# making it available for viewing through Code.org's fallback video player.

# Dependency requirements:
# - viddl-rb (`gem install viddl-rb`) - for downloading the video
# - ffmpeg (`brew install ffmpeg` / `apt-get install ffmpeg`) - for transcoding local videos
# - s3_access_key_id and s3_secret_access_key defined (e.g. in `locals.yml`)

require 'cdo/aws/s3'
require 'tmpdir'
require 'open-uri'
require 'httparty'

class Youtube

  # Process a video with a YouTube identifier.
  # If filename is provided, transcode the local file with ffmpeg.
  # If no filename is provided, download the transcoded video from YouTube.
  #
  # When downloading from YouTube, an HTTP head request will first check the absence of the file.
  # If `force`==true, the head request will be skipped.
  def self.process(id, filename=nil, force=false)
    raise RuntimeError, 'Invalid YouTube ID' unless id =~ /^#{Video::YOUTUBE_ID_REGEX}$/
    if filename.nil? && !force
      thumbnail_url = "https:#{CDO.videos_url}/youtube/#{id}.jpg"
      response = HTTParty.head(thumbnail_url).response
      if response.is_a? ::Net::HTTPSuccess
        CDO.log.info "Video id: #{id} already processed"
        return
      end
    end

    Dir.mktmpdir do |dir|
      if filename
        # Run ffmpeg to transcode local file.
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
        # Run youtube-dl to download transcoded video from YouTube.
        url = "https://www.youtube.com/watch?v=#{id}"
        cmd = YoutubeDL::Runner.new(url, format: 18, output: "#{dir}/%(id)s.%(ext)s").command
      end

      IO.popen(cmd) { |output| output.each { |line| CDO.log.info('[Youtube] ' + line.chomp) } }
      raise RuntimeError, 'Video processing command exited with an error' unless $?.success?
      file = Dir.glob("#{dir}/*").first
      raise RuntimeError, 'Video not available in correct format' unless file && File.extname(file) == '.mp4'
      video_filename = AWS::S3.upload_to_bucket(CDO.videos_s3_bucket, "youtube/#{id}.mp4", File.open(file), acl: 'public-read', no_random: true, content_type: 'video/mp4')
      CDO.log.info "https:#{CDO.videos_url}/#{video_filename}"

      thumbnail_file = "https://i.ytimg.com/vi/#{id}/0.jpg"
      thumbnail = open(thumbnail_file) || raise(RuntimeError, 'Could not retrieve thumbnail for video')
      thumbnail_filename = AWS::S3.upload_to_bucket(CDO.videos_s3_bucket, "youtube/#{id}.jpg", thumbnail, acl: 'public-read', no_random: true)
      CDO.log.info "https:#{CDO.videos_url}/#{thumbnail_filename}"
    end
  end
end
