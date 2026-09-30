# == Schema Information
#
# Table name: project_reactions
#
#  id         :bigint           not null, primary key
#  project_id :integer          not null
#  user_id    :integer          not null
#  emoji      :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_project_reactions_on_project_id          (project_id)
#  index_project_reactions_on_project_user_emoji  (project_id,user_id,emoji) UNIQUE
#  index_project_reactions_on_user_id             (user_id)
#

# A viewer's emoji reaction on a project in the Tutor+ class project gallery.
class ProjectReaction < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :emoji, presence: true, inclusion: {in: EmojiReactions::EMOJIS}
  # Mirrors the unique index.
  validates :user_id, uniqueness: {scope: [:project_id, :emoji]}
end
