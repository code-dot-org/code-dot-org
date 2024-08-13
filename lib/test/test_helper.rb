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
    "couldBeAnyLab"
  end
end

class LevelAppLab
  def report_bug_url(request)
    "url"
  end

  def game
    "AppLab"
  end
end

class LevelGameLab
  def report_bug_url(request)
    "url"
  end

  def game
    "GameLab"
  end
end

class LevelSpriteLab
  def report_bug_url(request)
    "url"
  end

  def game
    "SpriteLab"
  end
end

class LevelWebLab
  def report_bug_url(request)
    "url"
  end

  def game
    "WebLab"
  end
end

class Game
  def self.gamelab
    "GameLab"
  end

  def self.applab
    "AppLab"
  end

  def self.spritelab
    "SpriteLab"
  end

  def self.weblab
    "WebLab"
  end

  def self.music
    "Music"
  end
end
