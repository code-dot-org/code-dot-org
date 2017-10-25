require 'minitest/reporters'
class CowReporter < Minitest::Reporters::ProgressReporter
  def report
    if passed?
      print `which cowsay > /dev/null && cowsay #{send('green') {'success'}}`
    end
    super
  end
end
