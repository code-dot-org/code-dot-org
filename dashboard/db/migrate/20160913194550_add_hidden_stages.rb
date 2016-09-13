class AddHiddenStages < ActiveRecord::Migration[5.0]
  def change
    create_table :hidden_stages do |hidden_stage|
      hidden_stage.belongs_to :section
      hidden_stage.belongs_to :stage
    end
  end
end
