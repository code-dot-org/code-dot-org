class AddPhaseAndLinkToWorkshop < ActiveRecord::Migration[4.2]
  def change
    add_column :workshops, :phase, :text
    add_column :workshops, :link, :text
  end
end
