# This script parses a CSV file of discount codes, and uses it to populate our
# db. The CSV file(s) should not be checked into our repo as they contain secrets.
# The file(s) are expected to have the following format:
# 1 header row
# 1 row for each entry, where a row contains a prefix column and a code column
# The full code is prefix + code
require 'securerandom'
require 'csv'
require_relative '../../dashboard/config/environment'
require src_dir 'database'

def populate_csv_data(filename, full_discount, expiration)
  csv_contents = CSV.read(filename)
  csv_contents.each do |line|
    code = line[0]
    CircuitPlaygroundDiscountCode.create!(
      code: code,
      full_discount: full_discount,
      expiration: expiration
    )
  end
end

full_discount = ARGV[0]
filename = ARGV[1]

unless full_discount && filename
  puts 'Expected usage: '
  puts 'populate_discount_codes <full_discount?> <path_to_csv_file>'
  exit(-1)
end

if full_discount == 'true'
  full_discount = true
elsif full_discount == 'false'
  full_discount = false
else
  puts 'first argument must be true or false'
  exit(-1)
end

populate_csv_data(filename, full_discount, Date.new(2021, 4, 30))

puts 'Complete'

#####
# Begin debug helper methods
#
# What follows is a set of helper methods for discount code functionality that
# can be copy/pasted into the console. They are designed to be used in non-prod
# environments
#####

# This method is not used directly in this script, but can be used to populate
# the db with fake discount codes. Usage looks something like:
# populate_fake_data(10, false, Date.new(2018, 12, 31))
# @param {boolean} full_discount - Is this a full or partial discount?
# @param {number} n - How many entries to create
def populate_fake_data(n, full_discount, expiration)
  n.times do
    # Create a bogus code
    prefix = full_discount ? 'FAKE0_' : 'FAKE100_'
    code = SecureRandom.hex(7)
    CircuitPlaygroundDiscountCode.create!(
      code: prefix + code,
      full_discount: full_discount,
      expiration: expiration
    )
  end
end

# This method is not used directly in this script, but can be used to add a teacher
# to a CSD cohort, so that they will be considered PD eligible for discount codes.
# Because this is modifying the cohort, it should not be run on prod (or if it is,
# you need to be sure to clean up after yourself).
def set_user_pd_eligible(teacher)
  teacher.cohorts << Cohort.find_or_create_by(name: 'CSD-TeacherConHouston')
end

# This method is not used directly in this script, but can be used to create a
# fake section for a teacher that causes our teacher to meet eligibility requirements
# i.e. 10+ students with progress in 5+ levels in csd2 and csd3
# Because it will create fake data, it should not be run on prod (or if it is,
# you need to be sure to clean up after yourself).
def create_discount_eligible_section(teacher, section_name = 'Discount Eligible Section')
  section = Section.create!(name: section_name, user_id: teacher.id)
  csd2 = Script.get_from_cache('csd2')
  csd3 = Script.get_from_cache('csd3')

  csd2_programming_level_ids = csd2.levels.select {|level| level.is_a?(Weblab)}.map(&:id).first(5)
  csd3_programming_level_ids = csd3.levels.select {|level| level.is_a?(Gamelab)}.map(&:id).first(5)

  10.times do |n|
    student = User.create!(
      name: "Student#{n}",
      user_type: 'student',
      age: 20,
      password: 'secret',
      provider: 'sponsored',
    )
    section.add_student(student)
    csd2_programming_level_ids.each do |level_id|
      UserLevel.find_or_create_by!(user_id: student.id, level_id: level_id, script_id: csd2.id)
    end
    csd3_programming_level_ids.each do |level_id|
      UserLevel.find_or_create_by!(user_id: student.id, level_id: level_id, script_id: csd3.id)
    end
  end
  section
end

# This will generate a report on the status of all of our discount applications.
# It will print out a bunch of rows, one per line. You can then copy paste this
# into google sheets. After pasting, click on the little icon that shows up and
# select "Split text into columns"
def discount_code_reporting
  rows = []
  rows << [
    'User Id', 'User Name', 'Unit6Intention', 'AdminOverrode',
    'User signature', 'Sign Date', 'Full Discount', 'Discount Code', 'Last updated',
    'School Id'
  ].join(',')
  CircuitPlaygroundDiscountApplication.all.each do |app|
    rows << [
      app.user_id,
      app.user.name,
      app.unit_6_intention,
      app.admin_set_status,
      app.signature,
      app.signed_at,
      app.full_discount,
      app.circuit_playground_discount_code.try(:code),
      app.updated_at,
      app.school_id,
    ].join(',')
  end
  puts rows
end
