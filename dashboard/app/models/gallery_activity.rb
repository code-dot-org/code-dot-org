class GalleryActivity < ActiveRecord::Base
  belongs_to :user
  belongs_to :activity

  before_save :set_app

  def set_app
    return unless activity
    self.app = activity.try(:level).try(:game).try(:app)
  end
end
