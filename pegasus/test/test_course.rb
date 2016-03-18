require 'minitest/autorun'
require_relative '../src/env'
require src_dir 'course'

class CourseTest < Minitest::Test
  describe Course do
    def setup
      @course = Course.new('course1')
    end

    it 'should create with a type' do
      assert Course.new('csp').is_a? Course
    end

    it 'should verify directory names' do
      assert(@course.valid_lesson_directory_name('1'))
      assert(@course.valid_lesson_directory_name('6-2'))
      assert(@course.valid_lesson_directory_name('.go_ahead_process_me'))
      assert(!@course.valid_lesson_directory_name('.'))
      assert(!@course.valid_lesson_directory_name('..'))
      assert(!@course.valid_lesson_directory_name('_dont_parse_me'))
    end

    it 'should verify directory existence' do
      assert(@course.valid_lesson_directory?('1')) # exists for course1
      assert(!@course.valid_lesson_directory?('999')) # does not
    end

    it 'should get empty array for units when no units' do
      assert_equal([], @course.get_units)
    end

    it 'should get all lessons' do
      assert_equal(18, @course.get_lessons.count)
      assert(@course.get_lessons.first.is_a?(Lesson))
    end

    describe 'with unit numbers' do
      def setup
        @course_with_units = Course.new('csp')
        @course_without_units = Course.new('course1')
      end

      it 'should get units when has units' do
        assert(@course_with_units.get_units.count > 0)
        assert(@course_without_units.get_units.empty?)
      end

      it 'should recognize that it has units' do
        assert(@course_with_units.has_units?)
        assert(!@course_without_units.has_units?)
      end

      it 'should get lesson numbers when there are unit numbers' do
        assert_equal('3', @course_with_units.lesson_number('3'))
        assert_equal('03', @course_with_units.lesson_number('03'))
        assert_equal('10', @course_with_units.lesson_number('3-10'))
        assert_equal('05', @course_with_units.lesson_number('3-05'))
      end

      it 'should determine whether lessons are in unit' do
        assert(@course_with_units.lesson_in_unit?('3-5', '3'))
        assert(!@course_with_units.lesson_in_unit?('3-5', '4'))
      end

      it 'should get all lessons' do
        assert(!@course_with_units.get_lessons.empty?)
        assert(@course_with_units.get_lessons.first.is_a?(Lesson))
      end
    end
  end

  describe 'various supporting structs' do
    it 'should get created with right types' do
      assert Unit.new.is_a? Unit
      assert Lesson.new.is_a? Lesson
    end
  end
end
