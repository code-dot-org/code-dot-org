class RemoveHrefFromExternal < ActiveRecord::Migration[5.0]
  def up
    External.all.each{|level| level.update!(properties: level.properties.except('href'))}
  end

  def down
    # This migration is irreversible.
  end
end
