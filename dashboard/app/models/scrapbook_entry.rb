# == Schema Information
#
# Table name: scrapbook_entries
#
#  id               :bigint           not null, primary key
#  user_id          :integer          not null
#  script_id        :integer          not null
#  level_id         :integer          not null
#  before_asset_url :text(16777215)
#  after_asset_url  :text(16777215)
#  at_first_text    :text(65535)
#  but_then_text    :text(65535)
#  and_now_text     :text(65535)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_scrapbook_entries_on_user_id                             (user_id)
#  index_scrapbook_entries_on_user_id_and_script_id_and_level_id  (user_id,script_id,level_id) UNIQUE
#
class ScrapbookEntry < ApplicationRecord
  belongs_to :user

  validates :script_id, :level_id, presence: true
  validates :at_first_text, :but_then_text, :and_now_text,
    length: {maximum: 500},
    allow_blank: true
  validates :user_id, uniqueness: {scope: [:script_id, :level_id]}
end
