#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# Latin America (latam), 2 sub-lists for es & pt

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
    # Reverse sort to start with more recent years.
    # query_subscribed_contacts dedupes by rejecting duplicate emails.
    queries.keys.sort.reverse_each do |query_name|
      query = queries[query_name]
      new_contacts = query_subscribed_contacts(q: query)
      puts "#{query_name}: #{new_contacts.count} contacts"
      contacts.merge! new_contacts
    end
  end
end

# Hoc signups per year, 2013-2016
es_queries = {
  es_2013: %Q(
    kind_s: CSEdWeekEvent2013 AND
    (
      country_s:(#{es_country_code_or_list}) OR
      create_ip_country_s:(#{es_country_or_list})
    )
  ),
  es_2014: %Q(
    kind_s: HocSignup2014 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list})
    )
  ),

  # 'la' is an exception to the ISO 3166 country codes,
  # it's our own code for the Latin America region and localized page at hourofcode.com/la
  es_2015: %Q(
    kind_s: HocSignup2015 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list}) OR
      hoc_country_s:la
    )
  ),

  # 3 localized Hour of Code pages in Spanish during 2016 campaign (Latin America, Colombia, Peru)
  es_2016: %Q(
    kind_s: HocSignup2016 AND
    (
      location_country_s:(#{es_country_or_list}) OR
      create_ip_country_s:(#{es_country_or_list}) OR
      hoc_country_s:(la OR co OR pe)
    )
  )
}

pt_queries = {
  pt_2013: %q(
    kind_s: CSEdWeekEvent2013 AND
    (
      country_s:br OR
      create_ip_country_s:Brazil
    )
  ),
  pt_2014: %q(
    kind_s: HocSignup2014 AND
    (
      location_country_s:Brazil OR
      create_ip_country_s:Brazil
    )
  ),
  pt_2015: %q(
    kind_s: HocSignup2015 AND
    (
      location_country_s:Brazil OR
      create_ip_country_s:Brazil OR
      hoc_country_s:br
    )
  ),
  pt_2016: %q(
    kind_s: HocSignup2016 AND
    (
      location_country_s:Brazil OR
      create_ip_country_s:Brazil OR
      hoc_country_s:br
    )
  )
}

# ES
es_contacts = query_from_list es_queries
puts "#{es_contacts.count} total latam es contacts."
export_contacts_to_csv es_contacts, 'latam-es-contacts.csv'

# PT
pt_contacts = query_from_list pt_queries
puts "#{pt_contacts.count} total latam pt contacts."
export_contacts_to_csv pt_contacts, 'latam-pt-contacts.csv'
