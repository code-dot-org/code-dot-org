require 'set'

module CircleUtils
  # Checks the HEAD commit for the current circle build for the specified tag,
  # returning TRUE if it's present.  A tag is a set of space-separated words
  # wrapped in square brackets.  The words can be given in any order.
  #
  # Example:
  #   CircleUtils.tagged?('skip ui') will match commit messages containing the
  #   strings "[skip ui]" or "[ui skip]"
  def self.tagged?(tag)
    build_tags.include?(tag.downcase.split.to_set)
  end

  def self.circle_commit_message
    `git log --format=%B -n 1 $CIRCLE_SHA1`.strip
  end

  # @return [Set<Set<String>>] set of build tags in this build's commit message
  private_class_method def self.build_tags
    # Only parse the commit message once
    @tags ||= circle_commit_message.
        scan(/(?<=\[)[\w\d\s]+(?=\])/).
        map {|s| s.downcase.split.to_set }.
        to_set
  end

  # In unit tests, we want to bypass the cache and recompute tags.
  def self.__clear_cached_tags_for_test
    @tags = nil
  end
end
