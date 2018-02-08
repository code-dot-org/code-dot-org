class AddCommunityTypeToSchoolStatsByYears < ActiveRecord::Migration[5.0]
  def change
    add_column :school_stats_by_years, :community_type, :string, limit: 16, comment: 'Urban-centric community type'
  end
end
