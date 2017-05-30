#
# Allow tests to use a Timecop-like interface to pass real time, for special
# circumstances, like running against real Redis.
#
class FakeTimecop
  def self.freeze
    # No-op - included for interface compat. with Timecop.
  end

  def self.return
    # No-op - included for interface compat. with Timecop.
  end

  #
  # Pass real time - sleep for the given duration
  # @param [Float] seconds - how long to sleep
  #
  def self.travel(seconds)
    sleep seconds
  end
end
