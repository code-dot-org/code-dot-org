class DropFrequentUnsuccessfulLevelSourceAndLevelSourceHints < ActiveRecord::Migration[5.0]
  def up
    # Since we do not recreate the tables on rollback, we conditionally drop it
    # on its existence.
    if ActiveRecord::Base.connection.data_source_exists? :frequent_unsuccessful_level_sources
      drop_table :frequent_unsuccessful_level_sources
    end
    if ActiveRecord::Base.connection.data_source_exists? :level_source_hints
      drop_table :level_source_hints
    end
  end
end
