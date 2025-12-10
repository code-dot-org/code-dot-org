class CreateAidiffArtifacts < ActiveRecord::Migration[6.1]
  def change
    create_table :aidiff_artifacts do |t|
      t.string :type
      t.json :content
      t.string :title
      t.belongs_to :aidiff_thread, null: false
      t.belongs_to :user, null: false

      t.timestamps
    end

    create_table :aidiff_artifact_associations do |t|
      t.string :association_type, null: false
      t.belongs_to :aidiff_artifact, null: false
      t.belongs_to :section, optional: true
      t.belongs_to :lesson, optional: true
      t.belongs_to :unit, optional: true
      t.belongs_to :unit_group, optional: true
    end
  end
end
