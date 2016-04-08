class Api::V1::Pd::DistrictReportDataTableSerializer < ActiveModel::Serializer
  # Serialize into google chart DataTable json.
  # See https://developers.google.com/chart/interactive/docs/reference
  attributes :cols, :rows

  def cols
    [
      column('District Name'),
      column('Workshop Organizer'),
      column('Workshop Organizer Id'),
      column('Facilitators'),
      column('Workshop Dates'),
      column('Workshop Type'),
      column('Course'),
      column('Subject'),
      column('School'),
      column('Teacher Name'),
      column('Teacher Id'),
      column('Teacher Email'),
      column('Year'),
      column('Hours', 'number'),
      column('Days', 'number'),
      column('Payment Type'),
      column('Payment Rate', 'number'),
      column('Qualified', 'boolean'),
      column('Payment Amount', 'number')
    ]
  end

  def rows
    object.map do |row|
      {c: values(
        row,
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
        :days,
        {v: row[:payment_type], f: row[:payment_type] || 'N/A'},
        {v: row[:payment_rate], f: row[:payment_rate] || 'N/A'},
        {v: row[:qualified], f: row[:qualified] ? 'TRUE' : 'FALSE'},
        {v: row[:payment_amount], f: "$#{sprintf('%0.2f', (row[:payment_amount]))}"}
      )}
    end
  end

  def values(row, *keys)
    keys.map do |key|
      case key
        when Hash
          key
        else
          {v: row[key]}
      end
    end
  end

  def column(label, type = 'string', pattern = nil)
    {label: label, type: type}.tap do |col|
      if pattern
        col[:pattern] = pattern
      end
    end
  end
end
