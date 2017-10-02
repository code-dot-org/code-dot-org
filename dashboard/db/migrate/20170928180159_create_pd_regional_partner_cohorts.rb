class CreatePdRegionalPartnerCohorts < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_regional_partner_cohorts do |t|
      t.references :regional_partner, index: true
      t.integer :role, comment: 'teacher or facilitator'
      t.string :year, comment: 'free-form text year range, YYYY-YYYY, e.g. 2016-2017'
      t.string :course, null: false
      t.string :name, comment: 'Human readable name of cohort (not required, used to support large partners with multiple cohorts)'
      t.integer :size, comment: 'Number of people permitted in the cohort'
      t.references :summer_workshop, foreign_key: {to_table: :pd_workshops}
      t.timestamps null: false
    end

    create_join_table :pd_regional_partner_cohorts, :users do |t|
      t.index :pd_regional_partner_cohort_id, name: :index_pd_regional_partner_cohorts_users_on_cohort_id
      t.index :user_id
    end
  end
end
