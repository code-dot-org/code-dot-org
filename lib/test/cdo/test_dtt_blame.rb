require_relative '../test_helper'
require 'cdo/dtt_blame'
require 'tmpdir'

class DTTBlameTest < Minitest::Test
  # Runs the block chdir'd into a scratch git repo with local identity
  # config, so no global git config is required. DTTBlame's git commands
  # operate on Dir.pwd, same convention as the RakeUtils git helpers.
  def in_scratch_repo
    Dir.mktmpdir do |dir|
      Dir.chdir(dir) do
        git 'init', '-q'
        git 'config', 'user.name', 'Test Author'
        git 'config', 'user.email', 'test@example.org'
        git 'config', 'commit.gpgsign', 'false'
        yield
      end
    end
  end

  def git(*args)
    output = IO.popen(['git', *args], err: [:child, :out], &:read)
    raise "git #{args.join(' ')} failed:\n#{output}" unless $?.success?
    output.strip
  end

  # Commits a new file with the given subject; returns the short SHA.
  def commit(subject, author: 'Test Author <test@example.org>')
    @file_counter = (@file_counter || 0) + 1
    File.write("f#{@file_counter}.txt", subject)
    git 'add', '.'
    git 'commit', '-q', '-m', subject, '--author', author
    git 'rev-parse', '--short', 'HEAD'
  end

  def test_commits_since_returns_commits_after_base_newest_first
    in_scratch_repo do
      base = commit 'Base commit'
      second = commit 'Second commit', author: 'Alice <alice@example.org>'
      third = commit 'Third commit', author: 'Bob <bob@example.org>'

      commits = DTTBlame.commits_since(base)
      assert_equal 2, commits.length
      assert_equal({sha: third, author: 'Bob', subject: 'Third commit'}, commits[0])
      assert_equal({sha: second, author: 'Alice', subject: 'Second commit'}, commits[1])
    end
  end

  def test_commits_since_excludes_merge_commits
    in_scratch_repo do
      base = commit 'Base commit'
      main = git 'rev-parse', '--abbrev-ref', 'HEAD'
      git 'checkout', '-q', '-b', 'feature'
      commit 'Feature work'
      git 'checkout', '-q', main
      git 'merge', '-q', '--no-ff', '--no-edit', 'feature'

      subjects = DTTBlame.commits_since(base).map {|c| c[:subject]}
      assert_equal ['Feature work'], subjects
    end
  end

  def test_commits_since_preserves_tabs_and_parens_in_subject
    in_scratch_repo do
      base = commit 'Base commit'
      subject = "Fix\tthe thing (see\tnotes)"
      commit subject

      commits = DTTBlame.commits_since(base)
      assert_equal 1, commits.length
      assert_equal subject, commits[0][:subject]
      assert_equal 'Test Author', commits[0][:author]
    end
  end

  def test_empty_range_yields_no_commits_and_no_new_commits_summary
    in_scratch_repo do
      head = commit 'Only commit'

      commits = DTTBlame.commits_since(head)
      assert_equal [], commits
      assert_equal "no new commits since last green #{head}", DTTBlame.summary_line(head, commits)
    end
  end

  def test_valid_base_rejects_malformed_input_without_raising
    in_scratch_repo do
      commit 'Base commit'

      [nil, '', 'HEAD', 'abc; rm -rf /', 'master', 'xyz1234', 'abc123', 123].each do |bad|
        refute DTTBlame.valid_base?(bad), "expected valid_base?(#{bad.inspect}) to be false"
        assert_nil DTTBlame.commits_since(bad), "expected commits_since(#{bad.inspect}) to be nil"
      end
    end
  end

  def test_valid_base_false_for_well_formed_sha_not_in_history
    in_scratch_repo do
      commit 'Base commit'

      refute DTTBlame.valid_base?('deadbeefdeadbeef')
    end
  end

  def test_valid_base_true_for_commit_in_history
    in_scratch_repo do
      base = commit 'Base commit'

      assert DTTBlame.valid_base?(base)
    end
  end

  def test_authors_dedupes_preserving_first_appearance_order
    commits = [
      {sha: 'aaaaaaa', author: 'Bob', subject: 'one'},
      {sha: 'bbbbbbb', author: 'Alice', subject: 'two'},
      {sha: 'ccccccc', author: 'Bob', subject: 'three'},
      {sha: 'ddddddd', author: 'Carol', subject: 'four'},
      {sha: 'eeeeeee', author: 'Alice', subject: 'five'},
    ]
    assert_equal %w(Bob Alice Carol), DTTBlame.authors(commits)
  end

  def test_summary_line_counts_and_singularizes
    commits = [
      {sha: 'aaaaaaa', author: 'Bob', subject: 'one'},
      {sha: 'bbbbbbb', author: 'Alice', subject: 'two'},
      {sha: 'ccccccc', author: 'Bob', subject: 'three'},
    ]
    assert_equal '3 commits by 2 authors since last green abc12345',
      DTTBlame.summary_line('abc12345', commits)
    assert_equal '1 commit by 1 author since last green abc12345',
      DTTBlame.summary_line('abc12345', commits.first(1))
  end

  def test_commit_list_caps_at_max_and_reports_remainder
    commits = (1..35).map do |i|
      {sha: format('%07d', i), author: "Author #{i}", subject: "Subject #{i}"}
    end

    lines = DTTBlame.commit_list(commits).lines(chomp: true)
    assert_equal DTTBlame::MAX_LISTED + 1, lines.length
    assert_equal '0000001 Subject 1 (Author 1)', lines.first
    assert_equal '... and 5 more', lines.last

    capped = DTTBlame.commit_list(commits, max: 2)
    assert_equal ['0000001 Subject 1 (Author 1)', '0000002 Subject 2 (Author 2)', '... and 33 more'],
      capped.lines(chomp: true)

    assert_equal '', DTTBlame.commit_list([])
  end

  def test_commits_since_returns_nil_when_git_fails
    Dir.mktmpdir do |dir|
      Dir.chdir(dir) do
        assert_nil DTTBlame.commits_since('deadbeefdeadbeef')
      end
    end
  end

  def test_compare_url_spans_base_to_head
    in_scratch_repo do
      base = commit 'Base commit'
      commit 'Tip commit'
      head8 = git 'rev-parse', '--short=8', 'HEAD'

      assert_equal "https://github.com/code-dot-org/code-dot-org/compare/#{base}...#{head8}",
        DTTBlame.compare_url(base)
    end
  end
end
