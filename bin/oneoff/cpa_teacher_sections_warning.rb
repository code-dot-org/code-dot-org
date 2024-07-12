#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

CO_STATE = %w(CO Colorado)

# def main
#   Follower.find_each do |follower|
#     u = User.find_by(id: follower.student_user_id) || nil
#     puts "User: #{u.username}"
#     puts "User ID: #{u.id}"
#     next unless CO_STATE.include?(u.properties['us_state'])
#     puts 'User in Colorado detected'
#     u.sections_as_student.each do |s|
#       puts "Section : #{s.name}"
#       puts "Section ID: #{s.id}"
#       s.instructors.each do |teacher|
#         puts "Teacher : #{teacher.username}"
#         puts "Teacher email: #{teacher.email}"
#       end
#       #instructor = SectionInstructor.find_by(section_id: s.id)
#     end
#     #s = Section.find_by(followers: follower.student_user_id)
#   end
# end
#
def user_scan
  puts '| Id | teacher_id | cpa_teacher_section_id | Teacher | Teacher Email |'
  User.where("user_type = 'student'").find_each do |user|
    next unless user.age.to_i < 13
    next unless CO_STATE.include?(user.properties['us_state'])
    user.sections_as_student.each do |section|
      section.instructors.each do |teacher|
        puts "| #{user.username} | #{section.name} | #{section.id} | #{teacher.username} | #{teacher.email} |"
      end
    end
  end
end

user_scan
