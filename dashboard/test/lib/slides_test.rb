require 'test_helper'
require 'slides'

class SlidesTest < ActiveSupport::TestCase
  setup do
    # Slides#initialize accepts a base_path so tests can write under
    # tmp instead of touching the real config/slides tree.
    @tmpdir = Dir.mktmpdir('slides_test')
  end

  teardown do
    FileUtils.remove_entry(@tmpdir) if @tmpdir && File.exist?(@tmpdir)
  end

  test 'relative_path joins owner_kind, segments, and filename' do
    deck = Slides.new(
      owner_kind: :lesson,
      owner_id: 42,
      path_segments: ['intro-unit', 'html-basics'],
    )
    assert_equal(
      File.join('config', 'slides', 'lesson', 'intro-unit', 'html-basics', 'slides.json'),
      deck.relative_path
    )
  end

  test 'sanitizes path separators in segments' do
    deck = Slides.new(
      owner_kind: :lesson,
      owner_id: 1,
      path_segments: ['unit/with/slashes', 'lesson key'],
    )
    # `/` is rewritten to `_`; other characters (incl. spaces) pass
    # through so the directory still reads as the source identifier.
    assert_includes deck.relative_path, 'unit_with_slashes'
    assert_includes deck.relative_path, 'lesson key'
  end

  test 'read returns empty envelope when file does not exist' do
    deck = sandboxed_deck(owner_id: 7)
    assert_equal({'ownerKind' => 'lesson', 'ownerId' => 7, 'slides' => []}, deck.read)
  end

  test 'write then read round-trips slides' do
    deck = sandboxed_deck(owner_id: 7)
    slides = [
      {'key' => 'abc', 'description' => 'intro', 'panel' => nil},
      {'key' => 'def', 'description' => 'next', 'panel' => {'text' => 'hi'}},
    ]
    deck.write(slides)
    result = deck.read
    assert_equal 'lesson', result['ownerKind']
    assert_equal 7, result['ownerId']
    assert_equal slides, result['slides']
  end

  test 'read strips teacherNote when include_teacher_notes is false' do
    deck = sandboxed_deck(owner_id: 7)
    deck.write(
      [
        {'key' => 'a', 'description' => 'd', 'panel' => {'text' => 't', 'teacherNote' => 'private'}},
      ]
    )
    stripped = deck.read(include_teacher_notes: false)
    refute_includes stripped['slides'].first['panel'].keys, 'teacherNote'
    # Sanity: the default (include_teacher_notes: true) still keeps it.
    assert_equal 'private', deck.read['slides'].first['panel']['teacherNote']
  end

  test 'write creates intermediate directories' do
    deck = sandboxed_deck(owner_id: 99, segments: ['brand-new-unit'])
    refute File.exist?(File.dirname(deck.file_path))
    deck.write([])
    assert File.exist?(deck.file_path)
  end

  test 'different owner_kinds get distinct on-disk locations' do
    lesson = Slides.new(owner_kind: :lesson, owner_id: 1, path_segments: ['u', 'l'])
    unit = Slides.new(owner_kind: :unit, owner_id: 1, path_segments: ['u'])
    refute_equal lesson.relative_path, unit.relative_path
  end

  private def sandboxed_deck(owner_id:, segments: ['unit', 'lesson'])
    Slides.new(
      owner_kind: :lesson,
      owner_id: owner_id,
      path_segments: segments,
      base_path: @tmpdir,
    )
  end
end
