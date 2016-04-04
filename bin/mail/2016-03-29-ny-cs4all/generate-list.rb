#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'active_support'
require 'active_support/core_ext/object/blank'
require './generate-list-functions'

k5_pd_teachers = query_k5_pd_teachers
non_pd_teachers = query_non_pd_teachers(k5_pd_teachers)
hoc_organizers_no_code_studio = query_hoc_organizers_no_code_studio

all_results = k5_pd_teachers.merge(non_pd_teachers).merge(hoc_organizers_no_code_studio).except(*UNSUBSCRIBERS.keys)

puts "#{all_results.length} teachers."
export_contacts_to_csv all_results, 'teachers.csv'
