module CircleUtils
  def self.circle_commit_contains?(string)
    circle_commit_message.include?(string)
  end

  def self.circle_commit_message
    `git log --format=%B -n 1 $CIRCLE_SHA1`.strip
  end
end
