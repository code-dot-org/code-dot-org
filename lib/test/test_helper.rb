require_relative '../../shared/test/common_test_helper'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV.fetch('CIRCLE_TEST_REPORTS', nil)}/lib")
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

class Level
  def report_bug_url(request)
    "url"
  end

  def try(property)
    false
  end

  def game
    Game.new("couldBeAnyLab")
  end
end

class LevelAppLab
  def report_bug_url(request)
    "url"
  end

  def game
    Game.new("Applab")
  end
end

class LevelGameLab
  def report_bug_url(request)
    "url"
  end

  def game
    Game.new("Gamelab")
  end
end

class LevelSpriteLab
  def report_bug_url(request)
    "url"
  end

  def game
    Game.new("Spritelab")
  end
end

class LevelWebLab
  def report_bug_url(request)
    "url"
  end

  def game
    Game.new("Weblab")
  end
end

class Game
  attr_reader :name

  def initialize(name)
    @name = name
  end
end
