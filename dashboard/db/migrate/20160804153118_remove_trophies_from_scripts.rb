class RemoveTrophiesFromScripts < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.down do
        Script.find_by_name('20-hour').update(trophies: true)
      end
    end

    remove_column :scripts, :trophies, :boolean
  end
end
