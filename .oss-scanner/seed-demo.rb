# Demo accounts for exercising the app in a browser. Run from dashboard/:
#
#   bin/rails runner ../.oss-scanner/seed-demo.rb COURSE_NAME UNIT_NAME
#
# A teacher, a student, and a section of the teacher's with the student in it
# and COURSE_NAME assigned, at UNIT_NAME. Idempotent. The passwords are public: this database
# exists only in the OSS Scanner image.

PASSWORD = 'demo-password-1'.freeze

course = UnitGroup.find_by!(name: ARGV.fetch(0))
unit = course.default_units.find {|u| u.name == ARGV.fetch(1)} || abort("#{ARGV[1]} is not in #{course.name}")

teacher = User.find_by_email_or_hashed_email('demo-teacher@example.com') ||
  User.create!(user_type: 'teacher', email: 'demo-teacher@example.com', password: PASSWORD, name: 'Demo Teacher', age: 30)
student = User.find_by_email_or_hashed_email('demo-student@example.com') ||
  User.create!(user_type: 'student', email: 'demo-student@example.com', password: PASSWORD, name: 'Demo Student', age: 14)

section = Section.find_by(user: teacher, name: 'Demo Section') ||
  Section.create!(user: teacher, name: 'Demo Section', login_type: 'email', participant_type: 'student',
    course_id: course.id, script_id: unit.id)
section.add_student(student) unless section.students.include?(student)

puts "seed-demo: demo-teacher@example.com and demo-student@example.com (password #{PASSWORD}); " \
  "section #{section.code} on #{course.name}, #{unit.name}"
