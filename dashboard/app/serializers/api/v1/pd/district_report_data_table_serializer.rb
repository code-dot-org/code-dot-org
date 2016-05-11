class Api::V1::Pd::DistrictReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def cols
    names = [
      'District Name',
      'Workshop Organizer',
      'Workshop Organizer Id',
      'Facilitators',
      'Workshop Dates',
      'Workshop Type',
      'Course',
      'Subject',
      'School',
      'Teacher Name',
      'Teacher Id',
      'Teacher Email',
      'Year',
      {label: 'Hours', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
    if scope.admin?
      names += [
       'Payment Type',
       {label: 'Payment Rate', type: 'number'},
       {label: 'Qualified', type: 'boolean'},
       {label: 'Payment Amount', type: 'number'}
      ]
    end

    data_table_columns names
  end

  def rows
    object.map do |row|
      keys = [
        :district_name,
        :workshop_organizer_name,
        :workshop_organizer_id,
        :facilitators,
        :workshop_dates,
        :workshop_type,
        :course,
        :subject,
        :school,
        :teacher_name,
        :teacher_id,
        :teacher_email,
        :year,
        :hours,
        :days
      ]
      if scope.admin?
        keys += [
          {v: row[:payment_type], f: row[:payment_type] || 'N/A'},
          {v: row[:payment_rate], f: row[:payment_rate] || 'N/A'},
          {v: row[:qualified], f: row[:qualified] ? 'TRUE' : 'FALSE'},
          {v: row[:payment_amount], f: "$#{sprintf('%0.2f', (row[:payment_amount]))}"}
        ]
      end

      data_table_row row, keys
    end
  end
end
