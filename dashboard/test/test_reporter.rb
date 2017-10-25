require 'minitest/reporters'
class CowReporter < Minitest::Reporters::ProgressReporter
  def report
    if passed? && ENV['TEST_COW']
      print `cowsay #{send('green') {'success'}}`
    end
    super
  end
end
