require 'test_helper'

class ChallengeTest < ActiveSupport::TestCase
  setup do
    @unit = create(:unit, name: 'challenge-test-unit')
    @lesson = create(:lesson, script: @unit, key: 'challenge-test-lesson')
  end

  def challenge_data(overrides = {})
    {
      key: 'test-challenge',
      unit_name: @unit.name,
      lesson_key: @lesson.key,
      question: 'Draw a cat.',
      default_modality: 'whiteboard',
      rubric: [
        {'level' => 0, 'description' => 'No cat'},
        {'level' => 1, 'description' => 'A cat'},
      ],
      whiteboard_starter_image_key: nil,
      whiteboard_starter_image_alt_text: nil,
    }.merge(overrides)
  end

  def seed_from(data)
    Dir.mktmpdir do |tmpdir|
      path = File.join(tmpdir, 'test-challenge.json')
      File.write(path, data.to_json)
      Challenge.seed_record(path)
    end
  end

  test 'key must be unique and file-safe' do
    create(:challenge, key: 'dup-key')
    refute build(:challenge, key: 'dup-key').valid?
    refute build(:challenge, key: '../../evil').valid?
    refute build(:challenge, key: nil).valid?
  end

  test 'default_modality is required' do
    refute build(:challenge, default_modality: nil).valid?
  end

  test 'rejects rubrics the evaluator cannot grade' do
    [
      nil,
      [],
      'not a list',
      [{'level' => '0', 'description' => 'a'}],
      [{'level' => 0, 'description' => ''}],
      [{'level' => 0}],
      [{'level' => 0, 'description' => 'a'}, {'level' => 0, 'description' => 'b'}],
    ].each do |rubric|
      refute build(:challenge, rubric: rubric).valid?, rubric.inspect
    end
  end

  test 'a starter image requires alt text and a whiteboard modality' do
    assert build(:challenge, whiteboard_starter_image_key: 'a', whiteboard_starter_image_alt_text: 'a grid').valid?
    assert build(:challenge, default_modality: 'both', whiteboard_starter_image_key: 'a', whiteboard_starter_image_alt_text: 'a grid').valid?
    refute build(:challenge, whiteboard_starter_image_key: 'a').valid?
    refute build(:challenge, default_modality: 'video', whiteboard_starter_image_key: 'a', whiteboard_starter_image_alt_text: 'a grid').valid?
  end

  test 'starter_image_url is present only with a starter image' do
    assert_nil create(:challenge).starter_image_url
    challenge = create(:challenge, whiteboard_starter_image_key: 'a', whiteboard_starter_image_alt_text: 'a grid')
    assert_equal "/challenges/#{challenge.id}/starter_image", challenge.starter_image_url
  end

  test 'upload_starter_image writes a public PNG to the images bucket' do
    challenge = build(:challenge, whiteboard_starter_image_key: 'a')
    AWS::S3.expects(:upload_to_bucket).with(
      'images.code.org', 'challenge_starter_images/a.png', 'bytes',
      has_entries(no_random: true, content_type: 'image/png', acl: 'public-read')
    )
    challenge.upload_starter_image('bytes')
  end

  test 'write_serialization writes a file readable by seed_record' do
    Dir.mktmpdir do |tmpdir|
      challenge = create(
        :challenge,
        lesson: @lesson,
        key: 'write-test',
        whiteboard_starter_image_key: 'write-test-ab12',
        whiteboard_starter_image_alt_text: 'a grid'
      )
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)
      challenge.stubs(:file_path).returns(Pathname.new(tmpdir).join('write-test.json'))

      challenge.write_serialization
      written = JSON.parse(File.read(challenge.file_path))
      assert_equal 'write-test', written['key']
      assert_equal @unit.name, written['unit_name']
      assert_equal @lesson.key, written['lesson_key']
      assert_equal 'write-test-ab12', written['whiteboard_starter_image_key']

      challenge.destroy!
      Challenge.seed_record(challenge.file_path)
      seeded = Challenge.find_by!(key: 'write-test')
      assert_equal @lesson, seeded.lesson
      assert_equal challenge.rubric, seeded.rubric
      assert_equal 'a grid', seeded.whiteboard_starter_image_alt_text
    end
  end

  test 'seed_record updates an existing challenge' do
    create(:challenge, key: 'test-challenge', lesson: @lesson, question: 'Old question')
    seed_from(challenge_data(question: 'New question'))

    assert_equal 'New question', Challenge.find_by!(key: 'test-challenge').question
  end

  test 'seed_record raises when the lesson is unknown' do
    assert_raises(ActiveRecord::RecordNotFound) do
      seed_from(challenge_data(lesson_key: 'no-such-lesson'))
    end
  end

  test 'seed_record raises on an invalid challenge' do
    assert_raises(ActiveRecord::RecordInvalid) do
      seed_from(challenge_data(rubric: []))
    end
  end

  test 'seed_all skips bad files and continues seeding remaining files' do
    Dir.mktmpdir do |tmpdir|
      root = Pathname.new(tmpdir)
      File.write(root.join('bad.json'), 'not valid json {{')
      File.write(root.join('good.json'), challenge_data.to_json)

      assert_nothing_raised do
        Challenge.seed_all(root_dir: root, glob: '*.json')
      end

      assert Challenge.exists?(key: 'test-challenge')
    end
  end

  test 'seed_all destroys challenges whose file is gone, unless they have responses' do
    removed = create(:challenge, key: 'removed-challenge')
    answered = create(:challenge, key: 'answered-challenge')
    create(:challenge_response, challenge: answered)

    Dir.mktmpdir do |tmpdir|
      root = Pathname.new(tmpdir)
      File.write(root.join('good.json'), challenge_data.to_json)

      Challenge.seed_all(root_dir: root, glob: '*.json')

      assert Challenge.exists?(key: 'test-challenge')
      refute Challenge.exists?(id: removed.id)
      assert Challenge.exists?(id: answered.id)
    end
  end

  test 'seed_all destroys nothing when a file fails to seed' do
    kept = create(:challenge, key: 'kept-challenge')
    Dir.mktmpdir do |tmpdir|
      root = Pathname.new(tmpdir)
      File.write(root.join('bad.json'), 'not valid json {{')

      Challenge.seed_all(root_dir: root, glob: '*.json')

      assert Challenge.exists?(id: kept.id)
    end
  end
end
