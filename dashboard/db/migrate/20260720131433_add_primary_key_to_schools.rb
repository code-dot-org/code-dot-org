class AddPrimaryKeyToSchools < ActiveRecord::Migration[7.0]
  # `schools.id` is the 12-char NCES identifier: already NOT NULL and covered by a
  # UNIQUE index (index_schools_on_id). Promote `school.id` (12-char NCES identifier) to a real PRIMARY KEY so the table
  # can be replicated by Zero ETL, which requires a MySQL primary key. Rails `self.primary_key = 'id'` on the model is
  # not sufficient.
  def up
    execute <<~SQL.squish
      ALTER TABLE schools
        ADD PRIMARY KEY (id),
        DROP INDEX index_schools_on_id
    SQL
  end

  def down
    execute <<~SQL.squish
      ALTER TABLE schools
        DROP PRIMARY KEY,
        ADD UNIQUE INDEX index_schools_on_id (id)
    SQL
  end
end
