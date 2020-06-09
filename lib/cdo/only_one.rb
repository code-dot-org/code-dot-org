# Ensure only one instance of a Ruby script is running at a time,
# using `File#flock` (advisory lock) on the script path.
def only_one_running?(script)
  # Prevent locked file from being closed by garbage-collector.
  ($only_one = File.new(script)).
    flock(File::LOCK_NB | File::LOCK_EX)
end
