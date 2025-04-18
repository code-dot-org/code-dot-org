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
FactoryBot.define do
  factory :seeded_commit do
    commit_hash {SecureRandom.hex(20)}
    traits_for_enum :status
  end
end
