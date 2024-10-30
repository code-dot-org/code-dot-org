require 'set'

CIRCLE_NODE_TOTAL = ENV['CIRCLE_NODE_TOTAL'].to_i
CI_JOB = ENV['CI_JOB'].to_i

module CIUtils
  # Checks the HEAD commit for the current circle build for the specified tag,
  # returning TRUE if it's present.  A tag is a set of space-separated words
  # wrapped in square brackets.  The words can be given in any order.
  #
  # Example:
  #   CIUtils.tagged?('skip ui') will match commit messages containing the
  #   strings "[skip ui]" or "[ui skip]"
  def self.tagged?(tag)
    build_tags.include?(tag.downcase.split.to_set)
  end

  def self.git_commit_message
    `git log --format=%B -n 1 $GIT_COMMIT`.strip
  end

  def self.unit_test_container?
    CIRCLE_NODE_TOTAL == 1 || CI_JOB == "unit_tests"
  end

  def self.ui_test_container?
    CIRCLE_NODE_TOTAL == 1 || CI_JOB == "ui_tests"
  end

  def self.running_on_ci?
    ENV.fetch('CI', nil)
  end

  # In unit tests, we want to bypass the cache and recompute tags.
  def self.__clear_cached_tags_for_test
    @build_tags = nil
  end

  # @return [Set<Set<String>>] set of build tags in this build's commit message
  private_class_method def self.build_tags
    # Only parse the commit message once
    @build_tags ||= git_commit_message.
      scan(/(?<=\[)[\w\d\s]+(?=\])/).
      to_set {|s| s.downcase.split.to_set}
  end
end
