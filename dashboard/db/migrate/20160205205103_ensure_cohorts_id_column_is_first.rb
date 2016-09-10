# This migration was created to ensure consistent ordering of the id
# column in the cohorts_districts table in staging and production
# vs. test.  Although this column ordering difference is not very
# significant semantically, we want the environments to be as
# consistent as possible and the discrepancy was causing our schema
# dump consistency logic to throw an exception.
class EnsureCohortsIdColumnIsFirst < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
      ALTER TABLE cohorts_districts CHANGE column id id INT(11) NOT NULL AUTO_INCREMENT FIRST;
    SQL
  end
end
