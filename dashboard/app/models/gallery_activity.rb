# == Schema Information
#
# Table name: gallery_activities
#
#  id          :integer          not null, primary key
#  user_id     :integer          not null
#  activity_id :integer          not null
#  created_at  :datetime
#  updated_at  :datetime
#  autosaved   :boolean
#  app         :string(255)      default("turtle"), not null
#
# Indexes
#
#  index_gallery_activities_on_activity_id              (activity_id)
#  index_gallery_activities_on_app_and_autosaved        (app,autosaved)
#  index_gallery_activities_on_user_id_and_activity_id  (user_id,activity_id) UNIQUE
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
    self.last.try(:id) || 0
  end
end
