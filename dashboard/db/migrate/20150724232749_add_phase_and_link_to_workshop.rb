class AddPhaseAndLinkToWorkshop < ActiveRecord::Migration
  def change
    add_column :workshops, :phase, :text
    add_column :workshops, :link, :text
  end
end
