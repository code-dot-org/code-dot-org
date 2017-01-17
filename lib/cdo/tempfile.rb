require 'open-uri'
require 'open_uri_redirections' # support http -> https redirects
require 'pathname'

class Tempfile
  # Note: must retain reference to tempfile, or Ruby GC may delete it
  def self.from_url(url)
    as_valid_filename = Pathname(url).each_filename.to_a.last.split(' ').last
    tempfile = Tempfile.new([as_valid_filename, File.extname(as_valid_filename)])
    tempfile.binmode
    remote_data = URI.parse(url).open(allow_redirections: :safe).read
    tempfile.write(remote_data)
    tempfile.close
    tempfile
  end
end
