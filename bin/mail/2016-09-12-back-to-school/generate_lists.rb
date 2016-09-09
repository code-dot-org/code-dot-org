#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require './generate_list_functions'

# 1. k5: All teachers who have attended a K5 PD
pd_k5_teachers = dedupe query_k5_pd_teachers
puts "#{pd_k5_teachers.count} pd k5 teachers."
export_contacts_to_csv pd_k5_teachers, 'pd_k5_teachers.csv'

# 2. 6-12: All teachers who have attended a 6-12 PD
pd_6_12_teachers = dedupe query_6_12_pd_teachers
puts "#{pd_6_12_teachers.count} pd 6-12 teachers."
export_contacts_to_csv pd_6_12_teachers, 'pd_6_12_teachers.csv'

# 3. no-pd: All US code studio teachers who haven't attended a PD, and HOC organizers
no_pd_teachers = dedupe query_us_teachers_and_hoc_organizers
puts "#{no_pd_teachers.count} no-pd US teachers"
export_contacts_to_csv no_pd_teachers, 'no_pd_teachers.csv'

# 4. non-us: All international code studio teachers and HOC organizers
non_us_teachers = dedupe query_international_teachers_and_hoc_organizers
puts "#{non_us_teachers.count} no-pd international teachers"
export_contacts_to_csv non_us_teachers, 'non_us_teachers.csv'
