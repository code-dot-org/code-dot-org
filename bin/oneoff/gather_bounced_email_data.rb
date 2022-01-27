#!/usr/bin/env ruby

def email_count_to_percentage(email_count)
  (email_count.to_f / $total_emails.to_f).round(6) * 100
end

def pretty_print_hash(hash)
  result = ["\n"]
  hash.keys.each {|key| result.push "#{key}: #{hash[key]}"}
  result.join("\n")
end

# Read txt file and store lines that are JSON. Assuming email bodies aren't multiline.
emails = File.readlines('../../../Desktop/AWS Notification Message 1127.txt').map(&:chomp).select {|line| line[0] == '{'}
$total_emails = emails.count
puts "Total emails: #{$total_emails}"

# Parsing each log
parsed_emails = []
emails.each do |email|
  parsed_emails.push JSON.parse(email)
rescue
  # puts "Email at index #{index} failed to parse"
end

# Bounced emails
bounced_emails = parsed_emails.select {|email| email['notificationType'] == 'Bounce'}
puts "#{bounced_emails.count}(#{email_count_to_percentage(bounced_emails.count)}%) emails bounced in total within this time period"

# Most common diagnostic codes
# 5.7.1 and 5.1.1 _look_ to be the most common
# https://serversmtp.com/smtp-error/
diagnostic_codes = Hash.new 0
bounced_emails.each do |email|
  email['bounce']['bouncedRecipients'].each do |recipient|
    diagnostic_code = recipient['status']
    puts recipient['diagnosticCode'] if recipient['emailAddress'].include?('posta.istruzione.it')
    if !diagnostic_code
      # puts "No diagnosticCode for email at #{index}"
    else
      # puts diagnostic_code
      diagnostic_codes[diagnostic_code] = diagnostic_codes[diagnostic_code] + 1
    end
  end
rescue => e
  puts "Email at index #{index} failed to: #{e.message}"
  # e.backtrace
end

delivery_not_authorized = diagnostic_codes['5.7.1']
puts "#{delivery_not_authorized}(#{email_count_to_percentage(delivery_not_authorized)}%) of emails were bounced due to recipient server issues. More than likely the server blocking the email from the sender(code.org)."

bad_email_addresses = diagnostic_codes['5.1.1']
puts "#{bad_email_addresses}(#{email_count_to_percentage(bad_email_addresses)}%) of emails were bounced due to a bad email address."

sorted_codes_desc = diagnostic_codes.sort_by {|_k, v| -v}
top_5_codes = sorted_codes_desc.first(5).to_h
puts "The email counts for the top 5 SMTP response codes: #{pretty_print_hash(top_5_codes)}"

# Most popular recipient domains
bounced_recipient_domains = Hash.new 0
bounced_emails.each_with_index do |email, index|
  email['bounce']['bouncedRecipients'].each do |recipient|
    bounced_recipient_email = recipient['emailAddress']
    if !bounced_recipient_email
      puts "No emailAddress for email at #{index}"
    else
      bounced_recipient_domain = bounced_recipient_email.split('@')[-1]
      bounced_recipient_domains[bounced_recipient_domain] = bounced_recipient_domains[bounced_recipient_domain] + 1
    end
  end
rescue => e
  puts "Email at index #{index} failed to: #{e.message}"
  # e.backtrace
end

sorted_domains_desc = bounced_recipient_domains.sort_by {|_k, v| -v}
top_10_domains = sorted_domains_desc.first(10).to_h
puts "\nThe email counts for the top 10 email domains that were bounced: #{pretty_print_hash(top_10_domains)}"
