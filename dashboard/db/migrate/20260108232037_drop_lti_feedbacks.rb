class DropLtiFeedbacks < ActiveRecord::Migration[6.1]
  def up
    drop_table :lti_feedbacks, if_exists: true
  end
end
