class MakeActivityInGalleryActivityOptional < ActiveRecord::Migration[5.0]
  # Since there is no easy choice for the activity_id on a rollback, we define
  # up rather than change.
  def up
    # The third parameter indicates whether NULL values are allowed.
    # http://apidock.com/rails/ActiveRecord/ConnectionAdapters/SchemaStatements/change_column_null
    change_column_null :gallery_activities, :activity_id, true
  end
end
