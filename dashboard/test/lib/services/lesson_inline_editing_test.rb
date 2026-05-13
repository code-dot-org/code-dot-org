require 'test_helper'

class Services::LessonInlineEditingTest < ActiveSupport::TestCase
  describe '.allowed?' do
    it 'accepts every (model, field) pair in the allowlist' do
      Services::LessonInlineEditing::ALLOWED_FIELDS.each do |model_name, fields|
        fields.each do |field|
          assert Services::LessonInlineEditing.allowed?(model_name, field),
            "expected (#{model_name}, #{field}) to be allowed"
        end
      end
    end

    it 'rejects unknown models' do
      refute Services::LessonInlineEditing.allowed?('Vocabulary', 'word')
      refute Services::LessonInlineEditing.allowed?('Standard', 'description')
      refute Services::LessonInlineEditing.allowed?('Resource', 'name')
    end

    it 'rejects fields not on the allowlist' do
      refute Services::LessonInlineEditing.allowed?('Lesson', 'student_overview')
      refute Services::LessonInlineEditing.allowed?('LessonActivity', 'duration')
      refute Services::LessonInlineEditing.allowed?('ActivitySection', 'remarks')
    end

    it 'rejects structural and ordering fields' do
      %w(position lesson_id lesson_activity_id key id).each do |field|
        refute Services::LessonInlineEditing.allowed?('LessonActivity', field), "#{field} must not be editable in-page"
        refute Services::LessonInlineEditing.allowed?('ActivitySection', field), "#{field} must not be editable in-page"
      end
    end

    it 'rejects nil or empty inputs' do
      refute Services::LessonInlineEditing.allowed?(nil, 'overview')
      refute Services::LessonInlineEditing.allowed?('Lesson', nil)
      refute Services::LessonInlineEditing.allowed?('', '')
    end

    it 'accepts symbol field names' do
      assert Services::LessonInlineEditing.allowed?('Lesson', :overview)
    end
  end

  describe 'allowlist entries resolve to writable storage' do
    # Every allowlisted field must actually exist on the named class as both a
    # reader and a writer the endpoint can call via `record.send(field)` and
    # `record.assign_attributes(field => value)`. Without this, the endpoint
    # would 500 on a save attempt for a misspelled allowlist entry. This is the
    # contract: we don't care whether the field is a DB column or a
    # serialized_attrs property, only that the instance responds to it.
    it 'every entry has reader and writer methods on an instance of the named class' do
      Services::LessonInlineEditing::ALLOWED_FIELDS.each do |model_name, fields|
        klass = Services::LessonInlineEditing.model_class(model_name)
        assert klass, "model_class returned nil for allowlisted model #{model_name}"
        instance = klass.new
        fields.each do |field|
          assert instance.respond_to?(field),
            "(#{model_name}, #{field}) is on the allowlist but instances do not respond to #{field}"
          assert instance.respond_to?("#{field}="),
            "(#{model_name}, #{field}) is on the allowlist but instances do not respond to #{field}="
        end
      end
    end
  end

  describe '.model_class' do
    it 'returns the class for allowlisted models' do
      assert_equal Lesson, Services::LessonInlineEditing.model_class('Lesson')
      assert_equal LessonActivity, Services::LessonInlineEditing.model_class('LessonActivity')
      assert_equal ActivitySection, Services::LessonInlineEditing.model_class('ActivitySection')
    end

    it 'returns nil for non-allowlisted names without constantizing them' do
      # The point of going through this gate is so a malicious or buggy
      # request body cannot ask us to constantize an arbitrary class name.
      assert_nil Services::LessonInlineEditing.model_class('User')
      assert_nil Services::LessonInlineEditing.model_class('Object')
      assert_nil Services::LessonInlineEditing.model_class('NotAClass')
      assert_nil Services::LessonInlineEditing.model_class('')
    end
  end

  describe '.identifier_for and .parse_identifier' do
    it 'round-trips a (record, field) through the identifier' do
      record = Lesson.new
      record.id = 42
      id = Services::LessonInlineEditing.identifier_for(record, 'overview')
      assert_equal 'Lesson:42:overview', id

      parsed = Services::LessonInlineEditing.parse_identifier(id)
      assert_equal({model: 'Lesson', id: 42, field: 'overview'}, parsed)
    end

    it 'parses identifiers with the expected three parts' do
      assert_equal({model: 'ActivitySection', id: 7, field: 'description'}, Services::LessonInlineEditing.parse_identifier('ActivitySection:7:description'))
    end

    it 'returns nil for malformed identifiers' do
      [nil, '', 'just-a-string', 'Lesson:overview', ':42:overview', 'Lesson::overview', 'Lesson:not-an-int:overview', 42].each do |bad|
        assert_nil Services::LessonInlineEditing.parse_identifier(bad), "expected #{bad.inspect} to parse as nil"
      end
    end
  end
end
