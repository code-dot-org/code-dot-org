#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# Query all HOC organizers and Code Studio teachers from any of the Latam countries.

# Latin America (latam)
LATAM_ES_COUNTRIES = [
  'Mexico',
  'Guatemala',
  'El Salvador',
  'Costa Rica',
  'Nicaragua',
  'Belize',
  'Panama',
  'Cuba',
  'Dominican Republic',
  'Venezuela',
  'Colombia',
  'Ecuador',
  'Peru',
  'Bolivia',
  'Paraguay',
  'Uruguay',
  'Chile',
  'Argentina',
  'Puerto Rico'
].freeze
es_country_or_list = LATAM_ES_COUNTRIES.join(' OR ')

LATAM_ES_COUNTRY_CODES = %w(mx gt sv cr ni bz pa cu do ve co ec pe bo py uy cl ar pr).freeze
es_country_code_or_list = LATAM_ES_COUNTRY_CODES.join(' OR ')

def query_from_list(queries)
  {}.tap do |contacts|
    # query_subscribed_contacts dedupes by rejecting duplicate emails.
    queries.each do |query_name, query|
      new_contacts = query_subscribed_contacts(q: query)
      puts "#{query_name}: #{new_contacts.count} contacts"
      contacts.merge! new_contacts
    end
  end
end

# Code Studio teachers, and Hoc signups 2013-2016
queries = {
  teachers: %Q(
    kind_s: user && role_s: teacher &&
    create_ip_country_s:(#{es_country_or_list})
  ),

  # 3 localized Hour of Code pages in Spanish during 2016 campaign (Latin America, Colombia, Peru)
  hoc_2016: %Q(
    kind_s: HocSignup2016 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list}) OR
      hoc_country_s:(la OR co OR pe)
    )
  ),

  # 'la' is an exception to the ISO 3166 country codes,
  # it's our own code for the Latin America region and localized page at hourofcode.com/la
  hoc_2015: %Q(
    kind_s: HocSignup2015 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list}) OR
      hoc_country_s:la
    )
  ),

  hoc_2014: %Q(
    kind_s: HocSignup2014 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list})
    )
  ),

  hoc_2013: %Q(
    kind_s: CSEdWeekEvent2013 AND
    (
      country_s:(#{es_country_code_or_list}) OR
      create_ip_country_s:(#{es_country_or_list})
    )
  ),
}

contacts = query_from_list queries
puts "#{contacts.count} total latam contacts."
export_contacts_to_csv contacts, 'latam-contacts.csv'
