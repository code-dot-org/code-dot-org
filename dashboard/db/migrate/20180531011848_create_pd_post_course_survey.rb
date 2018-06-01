class CreatePdPostCourseSurvey < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_post_course_surveys do |t|
      t.integer :form_id, limit: 8, index: true, null: false
      t.integer :submission_id, limit: 8, index: {unique: true}, null: false
      t.text :answers
      t.string :year
      t.references :user, null: false
      t.string :course, null: false, comment: 'csd or csp'

      # Only allow one submission per user, form, year, and course.
      t.index [:user_id, :form_id, :year, :course], unique: true,
        name: :index_pd_post_course_surveys_on_user_form_year_course
    end
  end
end
