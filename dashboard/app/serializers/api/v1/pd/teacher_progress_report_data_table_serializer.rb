class Api::V1::Pd::TeacherProgressReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def column_definitions
    [
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
      {key: :hours, type: 'number'},
      {key: :days, type: 'number'}
    ]
  end
end
