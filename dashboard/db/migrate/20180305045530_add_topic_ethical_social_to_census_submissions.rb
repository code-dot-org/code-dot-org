class AddTopicEthicalSocialToCensusSubmissions < ActiveRecord::Migration[5.0]
  def change
    add_column :census_submissions, :topic_ethical_social, :boolean, comment: 'Survey option for school courses including ethical and social issues'
  end
end
