class Api::V1::Pd::TeacherProgressReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def cols
    names = [
      'District Name',
      'School',
      'Course',
      'Subject',
      'Workshop Dates',
      'Workshop Name',
      'Workshop Type',
      'Teacher Name',
      'Teacher Id',
      'Teacher Email',
      'Year',
      {label: 'Hours', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
    data_table_columns names
  end

  def rows
    object.map do |row|
      keys = [
        :district_name,
        :school,
        :course,
        :subject,
        :workshop_dates,
        :workshop_name,
        :workshop_type,
        :teacher_name,
        :teacher_id,
        :teacher_email,
        :year,
        :hours,
        :days
      ]
      data_table_row row, keys
    end
  end
end
