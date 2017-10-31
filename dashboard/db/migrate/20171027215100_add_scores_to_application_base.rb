class AddScoresToApplicationBase < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :response_scores, :text, comment: 'Scores given to certain responses'
  end
end
