# == Schema Information
#
# Table name: gallery_activities
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  user_level_id   :integer
#  level_source_id :integer
#  created_at      :datetime
#  updated_at      :datetime
#  autosaved       :boolean
#  app             :string(255)      default("turtle"), not null
#
# Indexes
#
#  index_gallery_activities_on_app_and_autosaved            (app,autosaved)
#  index_gallery_activities_on_level_source_id              (level_source_id)
#  index_gallery_activities_on_user_id_and_level_source_id  (user_id,level_source_id)
#  index_gallery_activities_on_user_level_id                (user_level_id)
#

class GalleryActivity < ActiveRecord::Base
  belongs_to :user
  belongs_to :level_source
  belongs_to :user_level

  before_save :set_app

  def set_app
    if user_level
      self.app = user_level.level.try(:game).try(:app)
    elsif level_source
      self.app = level_source.try(:level).try(:game).try(:app)
    end
  end

  def self.pseudocount
    # select count(*) is not a fast query but this is
    last.try(:id) || 0
  end
end
