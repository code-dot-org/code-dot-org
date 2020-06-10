# Ensure only one instance of a Ruby script is running at a time,
# using `File#flock` (advisory lock) on the provided script path.
# @return [Boolean] true if this is the only instance running.
def only_one_running?(path)
  !!((file = File.new(path)).
    flock(File::LOCK_NB | File::LOCK_EX) &&
    # Prevent locked files from being closed by garbage-collector.
    ($only_one ||= []) << file)
end
