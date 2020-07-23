class ConvertLevelSourceIdToBigintPeerReviews < ActiveRecord::Migration[5.0]
  def up
    change_column :peer_reviews, :level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :peer_reviews, :level_source_id, :int
  end
end
