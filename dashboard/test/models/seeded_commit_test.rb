require "test_helper"

class SeededCommitTest < ActiveSupport::TestCase
  test "defaults to not_started" do
    assert SeededCommit.new(commit_hash: "test").not_started?
    assert SeededCommit.create_from_current_hash.not_started?
    assert create(:seeded_commit).not_started?
  end

  test "can accurately identify most recent success" do
    commits = [
      create(:seeded_commit, :succeeded),
      create(:seeded_commit, :succeeded),
    ]
    assert_equal SeededCommit.most_recent_success, commits.last

    #? travel 1.day
    commits << create(:seeded_commit, :errored)
    assert_equal SeededCommit.most_recent_success, commits[1]

    #? travel 1.day
    commits << create(:seeded_commit, :succeeded)
    assert_equal SeededCommit.most_recent_success, commits.last
  end

  test "only allows one in-progress at a time" do
    first = create(:seeded_commit)
    assert first.in_progress!
    second = create(:seeded_commit)
    assert_raises ActiveRecord::RecordInvalid do
      second.in_progress!
    end
    first.succeeded!
    assert second.in_progress!
  end

  test "tracks success and failures" do
    commit = create(:seeded_commit)

    # Sets in progress while executing, and succeeded on successful completion
    refute commit.in_progress?
    commit.track_status do
      assert commit.in_progress?
    end
    assert commit.succeeded?

    # Sets to killed on ctrl-C or SIGKILL
    assert_raises SignalException do
      commit.track_status do
        raise SignalException.new("KILL")
      end
    end
    assert commit.killed?

    assert_raises Interrupt do
      commit.track_status do
        raise Interrupt
      end
    end
    assert commit.killed?

    # Sets to generic 'errored' if something else goes wrong
    assert_raises StandardError do
      commit.track_status do
        raise "uh-oh"
      end
    end
    assert commit.errored?
  end
end
