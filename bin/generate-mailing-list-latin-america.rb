#!/usr/bin/env ruby
require_relative '../pegasus/src/env'
require 'cdo/solr'
require src_dir 'database'

SOLR = Solr::Server.new(host: 'ec2-54-83-22-254.compute-1.amazonaws.com')

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

def query_contacts(params)
  fields = params[:fields] if params[:fields]

  [].tap do |results|
    SOLR.query(params.merge(rows: 10000)).each do |i|
      i = yield(i) if block_given?
      results << {email: i['email_s'].downcase.strip, name: i['name_s']}.merge(i.slice(*fields)) if i
    end
  end
end

def query_contacts_with_location(params)
  raise "there must be a query" if params[:q].nil?

  params = params.dup
  params[:q] += ' && ' + location_query if location_query
  params[:fq] = location_filter_query

  query_contacts(params)
end

UNSUBSCRIBERS = {}.tap do |results|
  DB[:contacts].where('unsubscribed_at IS NOT NULL').each do |i|
    email = i[:email].downcase.strip
    results[email] = true
  end
end
puts "#{UNSUBSCRIBERS.count} unsubscribers loaded."


TEACHERS = {}.tap do |results|
  (
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"mexico" || location_country_s:"Mexico")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"guatemala" || location_country_s:"Guatemala")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"el salvador" || location_country_s:"El Salvador")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"costa rica" || location_country_s:"Costa Rica")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"nicaragua" || location_country_s:"Nicaragua")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"belize" || location_country_s:"Belize")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"panama" || location_country_s:"Panama")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"cuba" || location_country_s:"Cuba")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"dominican republic" || location_country_s:"Dominican Republic")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"venezuela" || location_country_s:"Venezuela")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"colombia" || location_country_s:"Colombia")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"ecuador" || location_country_s:"Ecuador")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"peru" || location_country_s:"Peru")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"bolivia" || location_country_s:"Bolivia")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"paraguay" || location_country_s:"Paraguay")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"uruguay" || location_country_s:"Uruguay")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"chile" || location_country_s:"Chile")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"argentina" || location_country_s:"Argentina")') +
  query_contacts(q: '(kind_s:"CSEdWeekEvent2013" || kind_s:"HocSignup2014") & (country_s:"puerto rico" || location_country_s:"Puerto Rico")')
  ).each do |i|
    email = i[:email].downcase.strip
    results[email] = i unless UNSUBSCRIBERS[email]
  end
end
puts "#{TEACHERS.count} teachers loaded."

export_contacts_to_csv TEACHERS, "latin-america-excluding-brazil-teachers.csv"
