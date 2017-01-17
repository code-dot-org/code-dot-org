# == Schema Information
#
# Table name: gallery_activities
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  activity_id     :integer          not null
#  user_level_id   :integer
#  level_source_id :integer
#  created_at      :datetime
#  updated_at      :datetime
#  autosaved       :boolean
#  app             :string(255)      default("turtle"), not null
#
# Indexes
#
#  index_gallery_activities_on_activity_id                  (activity_id)
#  index_gallery_activities_on_app_and_autosaved            (app,autosaved)
#  index_gallery_activities_on_level_source_id              (level_source_id)
#  index_gallery_activities_on_user_id_and_activity_id      (user_id,activity_id) UNIQUE
#  index_gallery_activities_on_user_id_and_level_source_id  (user_id,level_source_id)
#  index_gallery_activities_on_user_level_id                (user_level_id)
#

class GalleryActivity < ActiveRecord::Base
  belongs_to :user
  belongs_to :activity

  before_save :set_app

  def set_app
    return unless activity
    self.app = activity.try(:level).try(:game).try(:app)
  end

  def self.pseudocount
    # select count(*) is not a fast query but this is
    last.try(:id) || 0
  end
end
