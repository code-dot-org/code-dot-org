require_relative '../../../pegasus/src/env'
require_relative '../../../lib/state_abbr'
require 'cdo/solr'
require src_dir 'database'

SOLR = Solr::Server.new(host: CDO.solr_server)

def common_script_path(name)
  File.join(File.dirname(__FILE__), name)
end

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

# Params:
#   file: csv file path to read
#   email: email column name
#   name: name column name
#   country_code: country code column name
#   country_code_us: country code value for US (otherwise international)
#   skip_emails: array of emails to skip
def include_csv(results, params)
  CSV.foreach(params[:file], headers: true) do |row|
    email = row[params[:email]]
    next if params.has_key?(:skip_emails) && params[:skip_emails].include?(email)
    international = !(row[params[:country_code]] && row[params[:country_code]] != '' && row[params[:country_code]] == params[:country_code_us])
    processed = {email: row[params[:email]], name: row[params[:name]], international: international.to_s}

    results[email] ||= processed unless UNSUBSCRIBERS[email] || ALL[email] # don't override duplicates
  end

  ALL.merge! results
end

def include_mailchimp_engineers(results)
  # read the mailchimp engineers csv and include new contacts in results

  # Mailchimp CSV headers:
  # "Email Address",Name,"ZIP code","Help time",Country,UNSUB_CAMPAIGN_ID,UNSUB_REASON,UNSUB_TIME,UNSUB_CAMPAIGN_TITLE,UNSUB_CAMPAIGN_ID,UNSUB_REASON,UNSUB_REASON_OTHER,"MailChimp Integration",Languages,"Help Location",MEMBER_RATING,OPTIN_TIME,OPTIN_IP,CONFIRM_TIME,CONFIRM_IP,LATITUDE,LONGITUDE,GMTOFF,DSTOFF,TIMEZONE,CC,REGION,LAST_CHANGED,LEID,EUID,NOTES

  # example rows:
  # rick@alchemydes.com,"Rick Hawkins",98110,,,,,,,,,,,"JavaScript, Perl, PHP","On-site at a school",2,,,"2013-06-25 17:38:27",,47.6614000,-122.2930000,-8,-7,America/Los_Angeles,US,WA,"2013-06-27 12:11:50",44877845,c2cb0681af,
  # hadipartovi@gmail.com,"hadi partovi test",,5hr/wk,Chile,,,,,,,,,"Java, C++, JavaScript, Perl, PHP, Python, Ruby, Scratch, Alice","On-site at a school, Mentoring students remotely, Developing curriculum or exercises",2,,,"2013-06-25 18:29:10",,33.7767000,-118.1460000,-8,-7,America/Los_Angeles,US,CA,"2013-06-27 12:13:08",44965861,77fd352c33,

  include_csv(results,
    file: 'mailchimp_engineers.csv',
    email: 'Email Address',
    name: 'Name',
    country_code: 'CC',
    country_code_us: 'US'
  )
end

def include_indiegogo_donors(results)
  # read the indiegogo donors csv
  # headers
  #Perk ID,Order No.,Pledge ID,Fulfillment Status,Funding Date,Payment Method,Appearance,Name,Email,Amount,Perk,Shipping Name,Shipping Address,Shipping Address 2,Shipping City,Shipping State/Province,Shipping Zip/Postal Code,Shipping Country

  # example rows:
  # "","",13620908,No Perk,2015-10-05 01:02:55 -0700,,Visible,Code.org Major Donors ,majordonors@code.org,$30,"","","","","","","",""
  # 2375299,1129,13620900,Order Placed,2015-10-05 01:00:27 -0700,FirstGiving,Visible,Muhannad Ahmad,muhannad@7distribution.com,$30,Hour of Code Sticker Pack,Muhannad Mustafa,"Business bay Dubai , U-Bowra Tower Office 402",,Dubai,,"=""00971""",United Arab Emirates
  # "","",13570557,No Perk,2015-09-30 10:30:57 -0700,,Visible,Code.org Major Donors ,majordonors@code.org,$80,"","","","","","","",""
  # 2375305,1128,13570533,Order Placed,2015-09-30 10:29:27 -0700,FirstGiving,Visible,Olivier Greoli,olivier@greoli.be,$80,Code.org Hat + Laptop Sticker,Olivier Greoli,Rue des ChÃ¢lets 4,,GrivegnÃ©e,,"=""4030""",Belgium

  include_csv(results,
    file: 'indiegogo.csv',
    email: 'Email',
    name: 'Name',
    country_code: 'Shipping Country',
    country_code_us: 'United States',
    skip_emails: ['majordonors@code.org']
  )
end

ALL_FILES = []

# naming convention:
# script to generate the csv:
#  generate-whoever
# csv
#  whoever.csv
# deduped csv
#  whoever-deduped.csv
#
# returns the deduped csv filename
def generate(name)
  puts "\n---" + name
  csv = name + '.csv'
  script = 'generate-' + name
  raise "Could not find #{script}" unless File.exist?(script)
  puts `time ./#{script}`
  raise "#{script} did not generate #{csv}" unless File.exist?(csv)
  puts `wc #{csv}`

  puts "deduping"
  deduped_csv = name + '-deduped.csv'
  if ALL_FILES.empty?
    puts `cp #{csv} #{deduped_csv}`
  else
    puts `#{common_script_path('subtract')} #{csv} #{ALL_FILES.join(' ')} #{deduped_csv}`
  end
  puts `wc #{deduped_csv}`

  puts 'international:'
  puts `grep true #{deduped_csv} | wc`

  ALL_FILES << deduped_csv # list of csvs for deduping future csvs

  deduped_csv
end

def query_all_emails_at_domain(domain)
  puts "Emails at #{domain}"

  {}.tap do |results|
    DB[:contacts].where(Sequel.ilike(:email,"%@#{domain}")).distinct.select(:name, :email).each do |contact|
      contact[:international] = false
      email = contact[:email]
      results[email] = contact unless UNSUBSCRIBERS[email] || ALL[email] # don't override duplicates
    end

    ALL.merge! results
  end
end
