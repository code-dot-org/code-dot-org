require_relative '../../pegasus/src/env'
require 'cdo/solr'
require src_dir 'database'

SOLR = Solr::Server.new(host: 'ec2-54-83-22-254.compute-1.amazonaws.com')

UNSUBSCRIBERS = {}.tap do |results|
  DB[:contacts].where('unsubscribed_at IS NOT NULL').each do |i|
    email = i[:email].downcase.strip
    results[email] = true
  end
end
puts "#{UNSUBSCRIBERS.count} unsubscribers loaded."

ALL = {}

def export_contacts_to_csv(contacts, path)
  columns = nil

  CSV.open(path, 'wb') do |results|
    contacts.values.each do |contact|
      unless columns
        columns = contact.keys
        results << columns
      end
      results << columns.map{|column| contact[column]}
    end
  end
end

COUNTRY_FIELDS_TO_US_VALUES =
  {
   'hoc_country_s' => ['us'],
   'country_s' => ['united states'],
   'create_ip_country_s' => ['united states', 'reserved']
  }

def international?(solr_record)
  COUNTRY_FIELDS_TO_US_VALUES.each do |field, us_values|
    record_value = solr_record[field]
    if record_value
      return !us_values.include?(record_value)
    end
  end
  # if the record has no country fields in it assume us
  return false
end

def query_contacts(params, &block)
  fields = params[:fields] if params[:fields]

  [].tap do |results|
    SOLR.query(params.merge(rows: 10000)).each do |i|
      next unless i
      i['international'] = international?(i)
      results << {email: i['email_s'].downcase.strip, name: i['name_s'], international: international?(i)}.merge(i.slice(*fields))
    end
  end
end

def query_subscribed_contacts(params, &block)
  {}.tap do |results|
    query_contacts(params, &block).each do |processed|
      email = processed[:email].downcase.strip
      results[email] = processed unless UNSUBSCRIBERS[email] || ALL[email] # don't override duplicates
    end

    ALL.merge! results
  end
end
