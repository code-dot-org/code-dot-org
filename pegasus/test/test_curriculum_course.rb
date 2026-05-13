require 'minitest/autorun'
require_relative '../src/env'
require src_dir 'curriculum_course'

class CurriculumCourseTest < Minitest::Test
  describe 'various supporting structs' do
    it 'should get created with right types' do
      assert CurriculumCourse::Unit.new.is_a? CurriculumCourse::Unit
      assert CurriculumCourse::Lesson.new.is_a? CurriculumCourse::Lesson
    end
  end
end
