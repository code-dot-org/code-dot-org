class CreateMetrics < ActiveRecord::Migration[5.0]
  def change
    create_table :metrics do |t|
      t.timestamps
      # The date on which this metric was computed.
      t.date :computed_on, null: false
      # The person or cron computing this metric.
      t.string :computed_by, null: false
      # The date the metric is capturing the value of.
      t.date :metric_on, null: false
      # If non-NULL, the course the metric is scoped to.
      t.string :course, null: true, default: nil
      # If non-NULL, the group (user_type, gender, geographical, etc.) that this
      # metric is scoped to.
      t.string :breakdown, null: true, default: nil
      # The metric being captured.
      t.string :metric, null: false
      # The submetric being captured.
      t.string :submetric, null: false
      # The value of the metric.
      t.float :value, null: false
    end
  end
end
