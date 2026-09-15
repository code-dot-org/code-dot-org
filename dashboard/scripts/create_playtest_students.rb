# Bulk-create sponsored students for a classroom playtest.
#
# Creates Student01..StudentN in an existing picture (or word) section and
# gives every one of them the same secret picture, so a room full of kids can
# log in from one instruction: "go to /sections/<CODE>, click your name, click
# the dog." Numbering continues past any StudentN already in the section, so
# the command is safe to run twice to add more.
#
# Refuses to run in production. From `bin/dashboard-console` on an adhoc:
#
#   load 'scripts/create_playtest_students.rb'
#   create_playtest_students(section_id: 123, count: 30, picture: 'dog')
#
# Picture names: alien bat bird cat dinosaur dog dragon ghost knight monster
# ninja octopus penguin pirate princess robot spacebot squirrel unicorn witch
# wizard zombie (see config/secret_pictures.csv). Returns the created users.

def create_playtest_students(section_id:, count:, picture: 'dog', name_prefix: 'Student', age: 10)
  raise 'refusing to create playtest accounts in production' if rack_env?(:production)

  section = Section.find(section_id)
  unless [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD].include?(section.login_type)
    raise "section #{section.id} has login_type #{section.login_type.inspect}; sponsored students need a picture or word section"
  end
  secret_picture = SecretPicture.find_by(name: picture) ||
    raise("no secret picture named #{picture.inspect}; options: #{SecretPicture.order(:id).pluck(:name).join(' ')}")
  if section.will_be_over_capacity?(count)
    raise "adding #{count} would put section #{section.id} over its capacity of #{section.capacity}"
  end

  taken = section.students.pluck(:name).filter_map do |n|
    m = /\A#{Regexp.escape(name_prefix)}(\d+)\z/.match(n)
    m[1].to_i if m
  end
  first = taken.max.to_i + 1
  last = first + count - 1
  # Zero-pad so the roster, which sorts by name, lists students in order.
  width = [2, last.to_s.length].max

  created = []
  User.transaction do
    (first..last).each do |i|
      student = User.create!(
        user_type: User::TYPE_STUDENT,
        provider: User::PROVIDER_SPONSORED,
        name: format("%s%0*d", name_prefix, width, i),
        age: age,
      )
      # before_create hands out a random picture; override it after the fact.
      student.update!(secret_picture: secret_picture)
      result = section.add_student(student, section.teacher)
      raise "add_student returned #{result.inspect} for #{student.name}" unless result == Section::ADD_STUDENT_SUCCESS
      created << student
    end
  end

  puts "Created #{created.size} students (#{created.first.name}..#{created.last.name}) in section #{section.id} \"#{section.name}\""
  puts "Login page: #{CDO.studio_url("/sections/#{section.code}")}"
  puts "Picture:    #{secret_picture.name}"
  puts "Words:      (word section, each student has their own; see the teacher dashboard)" if section.login_type == Section::LOGIN_TYPE_WORD
  created
end
