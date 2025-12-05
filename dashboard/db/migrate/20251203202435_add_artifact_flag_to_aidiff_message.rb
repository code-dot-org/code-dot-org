class AddArtifactFlagToAidiffMessage < ActiveRecord::Migration[6.1]
  def change
    add_column :aidiff_messages, :is_artifact_candidate, :boolean, default: false
    add_column :aidiff_messages, :artifact_candidate_type, :string
  end
end
