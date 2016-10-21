#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require_relative '../../../lib/country_regions'

# NOTE - this is the same recipient list as 2016-09-15-latam-hoc-starwars

LATAM_ES_COUNTRY_NAME_OR_LIST = LATAM_ES_COUNTRY_NAMES.join(' OR ').freeze
LATAM_ES_COUNTRY_CODE_OR_LIST = LATAM_ES_COUNTRY_CODES.join(' OR ').freeze

# Query all HOC organizers and Code Studio teachers from any of the ES Latam countries:
# Code Studio teachers, and Hoc signups 2013-2016
queries = {
  teachers: %Q(
    kind_s: user && role_s: teacher &&
    create_ip_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST})
  ),

  # 3 localized Hour of Code pages in Spanish during 2016 campaign (Latin America, Colombia, Peru)
  hoc_2016: %Q(
    kind_s: HocSignup2016 AND
    (
      location_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST}) OR
      create_ip_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST}) OR
      hoc_country_s:(la OR co OR pe)
    )
  ),

  # 'la' is an exception to the ISO 3166 country codes,
  # it's our own code for the Latin America region and localized page at hourofcode.com/la
  hoc_2015: %Q(
    kind_s: HocSignup2015 AND
    (
      location_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST}) OR
      create_ip_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST}) OR
      hoc_country_s:la
    )
  ),

  hoc_2014: %Q(
    kind_s: HocSignup2014 AND
    (
      location_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST}) OR
      create_ip_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST})
    )
  ),

  hoc_2013: %Q(
    kind_s: CSEdWeekEvent2013 AND
    (
      country_s:(#{LATAM_ES_COUNTRY_CODE_OR_LIST}) OR
      create_ip_country_s:(#{LATAM_ES_COUNTRY_NAME_OR_LIST})
    )
  ),
}

contacts = query_from_list queries
puts "#{contacts.count} total latam contacts."
export_contacts_to_csv contacts, 'latam-contacts.csv'
