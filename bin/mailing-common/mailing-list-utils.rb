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
    'location_country_s' => ['united states'],
    'location_country_code_s' => ["us"],
    'hoc_country_s' => ['us'],
    'country_s' => ['united states'],
    'create_ip_country_s' => ['united states', 'reserved']
  }

def international?(solr_record)
  COUNTRY_FIELDS_TO_US_VALUES.each do |field, us_values|
    record_value = solr_record[field]
    if record_value && !record_value.empty?
      record_value = record_value.downcase
      return !us_values.include?(record_value)
    end
  end
  # if the record has no country fields in it assume us
  return false
end

def query_contacts(params)
  fields = params[:fields] if params[:fields]

  [].tap do |results|
    SOLR.query(params.merge(rows: 10000)).each do |i|
      next unless i
      i['international'] = international?(i)
      results << {email: i['email_s'].downcase.strip, name: i['name_s'], international: international?(i).to_s}.merge(i.slice(*fields))
    end
  end
end

def query_subscribed_contacts(params)
  puts "query:"
  puts params[:q]

  {}.tap do |results|
    query_contacts(params).each do |processed|
      email = processed[:email].downcase.strip
      results[email] = processed unless UNSUBSCRIBERS[email] || ALL[email] # don't override duplicates
    end

    ALL.merge! results
  end
end

EMAIL = 'Email Address'
NAME = 'Name'
COUNTRY_CODE = 'CC'
COUNTRY_CODE_US = 'US'

def include_mailchimp_engineers(results)
  # read the mailchimp engineers csv and include new contacts in results

  # headers:
  # "Email Address",Name,"ZIP code","Help time",Country,UNSUB_CAMPAIGN_ID,UNSUB_REASON,UNSUB_TIME,UNSUB_CAMPAIGN_TITLE,UNSUB_CAMPAIGN_ID,UNSUB_REASON,UNSUB_REASON_OTHER,"MailChimp Integration",Languages,"Help Location",MEMBER_RATING,OPTIN_TIME,OPTIN_IP,CONFIRM_TIME,CONFIRM_IP,LATITUDE,LONGITUDE,GMTOFF,DSTOFF,TIMEZONE,CC,REGION,LAST_CHANGED,LEID,EUID,NOTES

  # example rows:
  # rick@alchemydes.com,"Rick Hawkins",98110,,,,,,,,,,,"JavaScript, Perl, PHP","On-site at a school",2,,,"2013-06-25 17:38:27",,47.6614000,-122.2930000,-8,-7,America/Los_Angeles,US,WA,"2013-06-27 12:11:50",44877845,c2cb0681af,
  # hadipartovi@gmail.com,"hadi partovi test",,5hr/wk,Chile,,,,,,,,,"Java, C++, JavaScript, Perl, PHP, Python, Ruby, Scratch, Alice","On-site at a school, Mentoring students remotely, Developing curriculum or exercises",2,,,"2013-06-25 18:29:10",,33.7767000,-118.1460000,-8,-7,America/Los_Angeles,US,CA,"2013-06-27 12:13:08",44965861,77fd352c33,

  CSV.foreach("mailchimp_engineers.csv", headers: true) do |row|
    international = !(row[COUNTRY_CODE] && row[COUNTRY_CODE] != '' && row[COUNTRY_CODE] == COUNTRY_CODE_US)
    email = row[EMAIL]
    processed = {email: row[EMAIL], name: row[NAME], international: international.to_s}

    results[email] ||= processed unless UNSUBSCRIBERS[email]
  end
end
