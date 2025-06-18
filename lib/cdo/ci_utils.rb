require 'set'

module CI
  module Utils
    # Checks the HEAD commit for the current CI build for the specified tag,
    # returning TRUE if it's present.  A tag is a set of space-separated words
    # wrapped in square brackets.  The words can be given in any order.
    #
    # Example:
    #   CI::Utils.tagged?('skip ui') will match commit messages containing the
    #   strings "[skip ui]" or "[ui skip]"
    def self.tagged?(tag)
      build_tags.include?(tag.downcase.split.to_set)
    end

    def self.git_commit_message
      `git log --format=%B -n 1 $GIT_COMMIT`.strip
    end

    def self.ci_job_unit_tests?
      ENV['CI_JOB'] == 'unit_tests'
    end

    def self.ci_job_ui_tests?
      ENV['CI_JOB'] == 'ui_tests'
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
end
