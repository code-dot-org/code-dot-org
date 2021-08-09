require 'digest/md5'
require 'tmpdir'

# Ensure only one instance of a Ruby script is running at a time,
# using `File#flock` (advisory lock) on a temp file based on the provided script path.
# @return [Boolean] true if this is the only instance running.
def only_one_running?(path)
  lock = File.join(Dir.tmpdir, Digest::MD5.hexdigest(File.absolute_path(path)))
  !!File.new(lock, File::CREAT).
    # Prevent locked Files from being auto-closed by garbage-collector.
    tap {|f| f.autoclose = false}.
    flock(File::LOCK_NB | File::LOCK_EX)
end
