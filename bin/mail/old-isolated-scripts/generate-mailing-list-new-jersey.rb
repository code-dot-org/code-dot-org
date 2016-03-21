#!/usr/bin/env ruby
require_relative '../../../pegasus/src/env'
require 'cdo/solr'
require src_dir 'database'

SETS = {
    seattle: {
        cities: ['Bainbridge Island',
                 'Spanaway',
                 'Bremerton',
                 'Lakewood',
                 'Eastonville',
                 'Enumclaw',
                 'Tacoma',
                 'Burien',
                 'Marysville',
                 'Seattle',
                 'Shoreline',
                 'Lake Forest Park',
                 'Tukwila',
                 'Lake Stevens',
                 'Snohomish',
                 'Everett',
                 'Lynwood',
                 'Federal Way',
                 'Puyallup',
                 'Oriting',
                 'Gig Harbor',
                 'Belfair',
                 'Silverdale',
                 'Poulsbo',
                 'Shelton',
                 'Lacey',
                 'Olympia',
                 'Chimacum'],
        state: 'Washington'
    },
    clark: {
        cities: ['Las Vegas',
                 'Boulder City',
                 'Henderson',
                 'Mesquite',
                 'North Las Vegas'],
        state: 'Nevada'
    },
    la: {
        cities: ['Bell',
                 'Cudahy',
                 'Florence',
                 'Gardena',
                 'Huntington Park',
                 'Lomita',
                 'Los Angeles',
                 'Marina del Rey',
                 'Maywood',
                 'San Fernando',
                 'South Gate',
                 'Topanga',
                 'Universal City',
                 'Vernon',
                 'View Park',
                 'Walnut Park',
                 'West Athens',
                 'Westmont',
                 'West Hollywood',
                 'Carson',
                 'Commerce',
                 'East Los Angeles',
                 'Hawthorne',
                 'Inglewood',
                 'Monterey Park',
                 'West Compton',
                 'Willowbrook'],
        state: 'California'
    },
    columbus: {
        pt: '39.98,-82.98',
        d: '40'
    }
}

def city_query
  queries = SETS[$key][:cities].map { |city| %(create_ip_city_s:"#{city}")}
  "(#{queries.join(' || ')})"
end

def state
  SETS[$key][:state]
end

def location_query
  if SETS[$key][:cities]
    city_query + ' && create_ip_state_s:"' + state + '"'
  end
end

def location_filter_query
  if SETS[$key][:pt]
    "{!geofilt pt=#{SETS[$key][:pt]} sfield=create_ip_location_p d=#{SETS[$key][:d]}}"
  end
end

SOLR = Solr::Server.new(host: CDO.solr_server)

def csv_contacts(path, params={})
  fields = params[:fields] if params[:fields]

  [].tap do |results|
    CSV.foreach(path, headers: true) do |i|
      i = yield(i) if block_given?
      results << {email: i['email'].downcase.strip, name: i['name']}.merge(i.to_hash.slice(*fields)) if i
    end
  end
end

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
  query_contacts(q: 'kind_s:"user" && role_s:"teacher" && create_ip_state_s:"New Jersey"') +
      query_contacts(q: 'kind_s:"Petition" && state_code_s:"nj"', fq: '-role_s:"student"') +
      query_contacts(q: 'kind_s:"VolunteerEngineerSubmission" && create_ip_state_s:"New Jersey"') +
      query_contacts(q: 'kind_s:"BringToSchool2013" && create_ip_state_s:"New Jersey"') +
      query_contacts(q: 'kind_s:"HocSignup2014" && create_ip_state_s:"New Jersey"') +
      query_contacts(q: 'kind_s:"CSEdWeekEvent2013" && create_ip_state_s:"New Jersey"')
  ).each do |i|
    email = i[:email].downcase.strip
    results[email] = i unless UNSUBSCRIBERS[email]
  end
end
puts "#{TEACHERS.count} teachers loaded."

export_contacts_to_csv TEACHERS, "new-jersey-teachers.csv"
