class Api::V1::Pd::WorkshopOrganizerReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def column_definitions
    [
      :organizer_name,
      :organizer_id,
      :organizer_email,
      :workshop_dates,
      :workshop_type,
      {key: :section_url, format: ->(value) {"<a href=#{value}>#{value}</a>"}},
      :facilitators,
      {key: :num_facilitators, type: 'number'},
      :workshop_name,
      :course,
      :subject,
      {key: :num_teachers, type: 'number'},
      {key: :days, type: 'number'}
    ].tap do |definitions|
      if scope.admin?
        definitions.push *[
          :payment_type,
          {key: :qualified, type: 'boolean', format: ->(value) {value ? 'TRUE' : 'FALSE'}},
          {key: :teacher_payment, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}},
          {key: :facilitator_payment, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}},
          {key: :staffer_payment, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}},
          {key: :venue_payment, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}},
          {key: :payment_total, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}}
        ]
      end
    end
  end
end
