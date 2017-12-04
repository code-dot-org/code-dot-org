require_relative '../../../pegasus/src/env'
require src_dir 'database'

PEGASUS_REPORTING_DB = sequel_connect CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader

# Load unsubscribers
unsubscribed = Set.new
CSV.foreach('Unsubscribed.csv', headers: true) do |row|
  unsubscribed.add(row['Email'])
end
puts "#{unsubscribed.count} unsubscribers loaded"

# Query all contacts, minus unsubscribers
query = 'SELECT email, name FROM contact_rollups WHERE opted_out IS NULL && email_malformed IS NULL'
count = 0
CSV.open('contacts.csv', 'wb') do |csv|
  csv << %w(email name)
  PEGASUS_REPORTING_DB.fetch(query).each do |row|
    next if unsubscribed.include? row[:email]
    csv << [row[:email], row[:name]]
    count += 1
  end
end

puts "#{count} contacts saved in contacts.csv"
