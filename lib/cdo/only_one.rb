# Ensure only one instance of a Ruby script is running at a time,
# using `File#flock` (advisory lock) on the provided script path.
# @return [Boolean] true if this is the only instance running.
def only_one_running?(path)
  !!File.new(path).
    # Prevent locked Files from being auto-closed by garbage-collector.
    tap {|f| f.autoclose = false}.
    flock(File::LOCK_NB | File::LOCK_EX)
end
