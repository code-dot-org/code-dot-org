class ProfessionalDevelopmentWorkshop

  def self.normalize(data)
    result = {}

    result[:dates] = required data[:dates]
    result[:location_name_s] = required stripped data[:location_name_s]
    result[:location_address_s] = required stripped data[:location_address_s]
    result[:grade_level_s] = 'K-5'
    result[:type_s] = required enum(data[:type_s].to_s.strip, ['Public', 'Private'])
    result[:capacity_s] = required stripped data[:capacity_s]
    result[:notes_s] = stripped data[:notes_s]
    result[:section_id_s] = stripped data[:section_id_s]

    # Email and name come from the dashboard user.
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = stripped data[:name_s]

    if data[:stopped]
      result[:stopped_dt] =  Time.now.gmtime.strftime("%F %R")
    end
    
    result
  end

  def self.receipt()
    'workshop_receipt'
  end

  def self.process(data)
    {}.tap do |results|
      location = search_for_address(data['location_address_s'])
      results.merge! location.to_solr if location
    end
  end

  def self.index(data)
    data = data.dup
    data['dates_ss'] = [].tap do |results|
      data['dates'].each do |date|
        results << date['date_s'] + ", " + date['start_time_s'] + " - " + date['end_time_s']
      end
    end
    data.delete('dates')

    # Remove this until we can get dates properly formatted for Solr.
    data.delete('stopped_dt')

    data
  end

  def self.solr_query(params)
    query = {
      kind_s: self.name,
      type_s: 'Public',
    }.map{|key,value| "#{key.to_s}:#{value.to_s}"}.join(' AND ')

    {
      q:query,
      rows:200,
    }
  end

end
