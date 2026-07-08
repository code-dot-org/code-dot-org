# Blame helpers for the DTT (the per-minute test-machine build daemon).
# Enumerates the commits between a known-green base SHA and HEAD of the
# git repository at Dir.pwd, and formats them for chat messages.
#
# Pure git plus string formatting: no Slack, no ChatClient, no CDO config.
#
# Security: the base SHA is parsed out of a Slack channel topic that humans
# can edit. It is untrusted. Every method that puts it in a shell command
# validates it against SHA_FORMAT first; callers should additionally gate
# on valid_base? and fall back when it returns false.
module DTTBlame
  MAX_LISTED = 30

  # Abbreviated or full hex SHA. Anything else is rejected.
  SHA_FORMAT = /\A\h{7,40}\z/

  # True iff sha is a 7-40 character hex string that resolves to a commit
  # in the local history. The format check runs before git is invoked, and
  # git is invoked without a shell.
  def self.valid_base?(sha)
    return false unless sha.is_a?(String) && SHA_FORMAT.match?(sha)
    system('git', 'cat-file', '-e', "#{sha}^{commit}", err: File::NULL) || false
  end

  # Commits in <sha>..HEAD, excluding merges, in git log order (newest
  # first, oldest last). Each element:
  #   {sha: String, author: String, subject: String}
  # Returns [] when the range is empty, nil when sha is malformed or git
  # fails (callers take the fallback path). Never raises on git failure.
  def self.commits_since(sha)
    return nil unless sha.is_a?(String) && SHA_FORMAT.match?(sha)
    log = `git log --no-merges --pretty=format:%h%x09%an%x09%s #{sha}..HEAD 2>/dev/null`
    return nil unless $?.success?
    log.each_line(chomp: true).map do |line|
      commit_sha, author, subject = line.split("\t", 3)
      {sha: commit_sha, author: author, subject: subject}
    end
  end

  # Unique author names from a commits_since result, in order of first
  # appearance.
  def self.authors(commits)
    commits.map {|commit| commit[:author]}.uniq
  end

  # One-line roll-up for chat:
  #   "17 commits by 9 authors since last green abc12345"
  #   "no new commits since last green abc12345"
  def self.summary_line(sha, commits)
    return "no new commits since last green #{sha}" if commits.empty?
    "#{pluralize(commits.length, 'commit')} by " \
      "#{pluralize(authors(commits).length, 'author')} since last green #{sha}"
  end

  # Multi-line commit list, one "abc1234 Subject line (Author Name)" per
  # line, capped at max lines with a trailing "... and N more" when over.
  # Returns '' for empty commits.
  def self.commit_list(commits, max: MAX_LISTED)
    lines = commits.first(max).map do |commit|
      "#{commit[:sha]} #{commit[:subject]} (#{commit[:author]})"
    end
    lines << "... and #{commits.length - max} more" if commits.length > max
    lines.join("\n")
  end

  # GitHub compare URL from sha to the current HEAD (8-char short SHA).
  def self.compare_url(sha)
    head = `git rev-parse --short=8 HEAD`.strip
    "https://github.com/code-dot-org/code-dot-org/compare/#{sha}...#{head}"
  end

  private_class_method def self.pluralize(count, noun)
    "#{count} #{noun}#{'s' unless count == 1}"
  end
end
