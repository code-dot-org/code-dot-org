class Api::V1::Pd::WorkshopOrganizerReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def cols
    names = [
      'Workshop Organizer',
      'Workshop Organizer Id',
      'Workshop Organizer Email',
      'Workshop Dates',
      'Workshop Type',
      'Section Url',
      'Facilitators',
      {label: 'Num Facilitators', type: 'number'},
      'Workshop Name',
      'Course',
      'Subject',
      {label: 'Num Teachers', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
    if scope.admin?
      names += [
        'Payment Type',
        {label: 'Qualified', type: 'boolean'},
        {label: 'Teacher Payment', type: 'number'},
        {label: 'Facilitator Payment', type: 'number'},
        {label: 'Staffer Payment', type: 'number'},
        {label: 'Venue Payment', type: 'number'},
        {label: 'Total Payment', type: 'number'}
      ]
    end

    data_table_columns names
  end

  def rows
    object.map do |row|
      keys = [
        :organizer_name,
        :organizer_id,
        :organizer_email,
        :workshop_dates,
        :workshop_type,
        {v: row[:section_url], f: "<a href=#{row[:section_url]}>#{row[:section_url]}</a>"},
        :facilitators,
        :num_facilitators,
        :workshop_name,
        :course,
        :subject,
        :num_teachers,
        :days
      ]
      if scope.admin?
        keys += [
          {v: row[:payment_type]},
          {v: row[:qualified], f: row[:qualified] ? 'TRUE' : 'FALSE'},
          {v: row[:teacher_payment], f: "$#{sprintf('%0.2f', (row[:teacher_payment]))}"},
          {v: row[:facilitator_payment], f: "$#{sprintf('%0.2f', (row[:facilitator_payment]))}"},
          {v: row[:staffer_payment], f: "$#{sprintf('%0.2f', (row[:staffer_payment]))}"},
          {v: row[:venue_payment], f: "$#{sprintf('%0.2f', (row[:venue_payment]))}"},
          {v: row[:payment_total], f: "$#{sprintf('%0.2f', (row[:payment_total]))}"}
        ]
      end

      data_table_row row, keys
    end
  end
end
