require_relative '../../shared/test/common_test_helper'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/lib")
end
Minitest::Reporters.use! reporters

class Level
  def report_bug_url(request)
    "url"
  end

  def try(property)
    false
  end
end

class LevelAppLab
  def report_bug_url(request)
    "url"
  end

  def try(property)
    property == :is_project_level
  end

  def game
    "AppLab"
  end
end

class LevelGameLab
  def report_bug_url(request)
    "url"
  end

  def try(property)
    property == :is_project_level
  end

  def game
    "GameLab"
  end
end

class Game
  def self.gamelab
    "GameLab"
  end

  def self.applab
    "AppLab"
  end
end
