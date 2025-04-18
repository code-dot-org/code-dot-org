# == Schema Information
#
# Table name: seeded_commits
#
#  id          :bigint           not null, primary key
#  commit_hash :string(255)      not null
#  status      :integer          default(0)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_seeded_commits_on_commit_hash  (commit_hash) UNIQUE
#  index_seeded_commits_on_updated_at   (updated_at)
#
class SeededCommit < ApplicationRecord
  enum status: {
    not_started: 0,
    in_progress: 1,
    succeeded: 2,
    errored: 3,
    killed: 4
  }, _default: :not_started

  validates :commit_hash, uniqueness: true

  # only allow one "in progress" at a time
  validates :status, uniqueness: true, if: -> {in_progress?}

  def self.most_recent_success
    succeeded.order(updated_at: :desc).first
  end

  def self.get_or_create_from_current_hash
    get_from_current_hash || create_from_current_hash
  end

  def self.get_from_current_hash
    find_by(commit_hash: GitUtils.git_revision)
  end

  def self.create_from_current_hash
    create(commit_hash: GitUtils.git_revision)
  end

  def to_update
    GitUtils.files_changed_between(commit_hash, most_recent_success.commit_hash)
  end

  # Example:
  #
  #   current_commit = SeededCommit.get_or_create_from_current_hash
  #   unless current_commit.succeeded? do
  #     current_commit.track_status do
  #       ScriptSeed.seed(current_commit.to_update)
  #     end
  #   end
  def track_status(&block)
    in_progress!

    begin
      yield
    rescue SignalException
      killed!
      raise
    rescue
      errored!
      raise
    else
      succeeded!
    end
  end
end
