class Api::V1::Pd::DistrictReportDataTableSerializer < ::Api::V1::DataTableSerializerBase
  attributes :cols, :rows

  def column_definitions
    [
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
      {key: :hours, type: 'number'},
      {key: :days, type: 'number'}
    ].tap do |definitions|
      if scope.admin?
        definitions.push *[
          {key: :payment_type, format: ->(value) {value || 'N/A'}},
          {key: :payment_rate, type: 'number', format: ->(value) {value || 'N/A'}},
          {key: :qualified, type: 'boolean', format: ->(value) {value ? 'TRUE' : 'FALSE'}},
          {key: :payment_amount, type: 'number', format: ->(value) {"$#{sprintf('%0.2f', (value))}"}}
        ]
      end
    end
  end
end
