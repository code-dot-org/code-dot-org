require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_offerings/sync_in'

describe I18n::Resources::Dashboard::CourseOfferings::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::CourseOfferings::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    _(described_class.superclass).must_equal I18n::Utils::SyncInBase
  end

  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/course_offerings.json')}

  describe '#process' do
    let(:process) {described_instance.process}

    let(:expected_i18n_data) {'expected_i18n_data'}
    let(:expected_i18n_json) {'expected_i18n_json'}

    before do
      described_instance.expects(:i18n_data).once.returns(expected_i18n_data)
      JSON.expects(:pretty_generate).with(expected_i18n_data).once.returns(expected_i18n_json)
    end

    it 'generates i18n data and writes source file to a JSON file' do
      process
      _(File.exist?(i18n_source_file_path)).must_equal true
      _(File.read(i18n_source_file_path)).must_equal expected_i18n_json
    end
  end

  describe '#i18n_data' do
    let(:i18n_data) {described_instance.send(:i18n_data)}

    let(:course_offering_1_path) {CDO.dir('dashboard/config/course_offerings/cs-test.json')}
    let(:course_offering_1_data) do
      {
        'key' => 'cs-test',
        'display_name' => 'CS Test',
        'description' => 'This is a test description for the CS Test course.'
      }
    end

    let(:course_offering_2_path) {CDO.dir('dashboard/config/course_offerings/course-a-test.json')}
    let(:course_offering_2_data) do
      {
        'key' => 'course-a-test',
        'display_name' => 'Course A Test',
        'description' =>  nil
      }
    end

    let(:expected_course_offerings_data) do
      {
        'cs-test' => {
          'display_name' => 'CS Test',
          'description' => 'This is a test description for the CS Test course.'
        },
        'course-a-test' => {
          'display_name' => 'Course A Test',
        }
      }
    end

    before do
      FileUtils.mkdir_p(File.dirname(course_offering_1_path))
      File.write(course_offering_1_path, JSON.dump(course_offering_1_data))

      FileUtils.mkdir_p(File.dirname(course_offering_2_path))
      File.write(course_offering_2_path, JSON.dump(course_offering_2_data))
    end

    it 'returns correct course offerings data' do
      _(i18n_data).must_equal expected_course_offerings_data
    end

    it 'sorts keys alphabetically' do
      keys = i18n_data.keys
      _(keys).must_equal keys.sort
    end

    it 'compacts nil values' do
      result = i18n_data
      _(result['course-a-test'].key?('description')).must_equal false
      _(result['course-a-test']['display_name']).must_equal 'Course A Test'
    end

    context 'with empty directory' do
      before do
        # Clear any existing files
        FileUtils.rm_rf(File.dirname(course_offering_1_path))
      end

      it 'returns empty hash' do
        _(i18n_data).must_be_empty
      end
    end
  end
end
