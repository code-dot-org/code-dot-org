class RemoveHrefFromExternal < ActiveRecord::Migration[5.0]
  def up
    # Intentionally does not run validation. This is because we know that we have
    # some number of external levels with duplicate names, which fail validation.
    External.find_each {|level| level.update_attribute('properties', level.properties.except('href'))}
  end

  def down
    # This migration is irreversible.
  end
end
