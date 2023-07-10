def generate_hoc_survey_report
  PEGASUS_DB[:forms].where(kind: 'HocSurvey2014').filter_map do |row|
    data = JSON.parse(row[:data]) rescue {}

    {
      email: data['email_s'],
      country: data['event_country_s'],
      teacher_type: data['teacher_description_s'],
      location_type: data['event_location_type_s'],
      students: data['students_number_total_s'],
      girls: data['students_number_girls_s'],
      ethnicity: data['students_number_ethnicity_s'],
      grades: data['students_grade_levels_ss'].to_csv,
      tutorials: data['event_tutorials_ss'].to_csv,
      technology: data['event_technology_s'],
      experience: data['event_experience_s'],
      improvement: data['event_improvement_s'],
      annual_event: data['event_annual_s'],
      teach_cs: data['teacher_plan_teach_cs_s'],
      first_year: data['teacher_first_year_s'],
      how_heard: data['teacher_how_heard_ss'].to_csv,
      how_heard_other: data['teacher_how_heard_other_s'],
      district: data['teacher_district_s'],
      prize_choice: data['prize_choice_s']
    }
  end
end
