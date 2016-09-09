#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'active_support'
require './generate_list_functions'

# 1. pd: All teachers k-12 who have attended a PD
pd_teachers = query_all_pd_teachers
puts "#{pd_teachers.count} pd teachers."
export_contacts_to_csv pd_teachers, 'pd_teachers.csv'

# 2. no-pd: All US code studio teachers who haven't attended a PD, and HOC organizers
no_pd_teachers = query_us_teachers_and_hoc_organizers.except *pd_teachers.keys
puts "#{no_pd_teachers.count} no-pd US teachers"
export_contacts_to_csv no_pd_teachers, 'no_pd_teachers.csv'

# 3. non-us: All international code studio teachers and HOC organizers
non_us_teachers = query_international_teachers_and_hoc_organizers.except(*pd_teachers.keys).except(*no_pd_teachers.keys)
puts "#{non_us_teachers.count} no-pd international teachers"
export_contacts_to_csv non_us_teachers, 'non_us_teachers.csv'
