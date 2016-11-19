class DropUserProfiles < ActiveRecord::Migration[5.0]
  def up
    # Since we do not recreate the tables on rollback, we conditionally drop it
    # on its existence.
    if ActiveRecord::Base.connection.data_source_exists? :user_profiles
      drop_table :user_profiles
    end
  end
end
