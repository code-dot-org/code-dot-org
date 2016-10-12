class RemoveTrophiesFromScripts < ActiveRecord::Migration[4.2]
  def change
    reversible do |dir|
      dir.down do
        Script.find_by_name('20-hour').update(trophies: true)
      end
    end

    remove_column :scripts, :trophies, :boolean, null: false, default: false
  end
end
