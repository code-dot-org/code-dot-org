require 'test_helper'

class Services::TeacherDirectoryVerification::DirectoryLookupTest < ActiveSupport::TestCase
  let(:teacher) {create(:teacher, :with_school_info)}
  let(:school) {teacher.school_info.school}
  let(:directory_url) {'https://directory.example.edu/staff'}

  test 'returns evidence for an exact email in a mailto link' do
    document = Nokogiri::HTML('<html><head><title>Staff</title></head><body><a href="mailto:TEACHER@example.edu">Contact</a></body></html>')
    stub_directory(directory_url, document)

    result = Services::TeacherDirectoryVerification::DirectoryLookup.call(
      school: school,
      email: 'teacher@example.edu',
    )

    assert_equal directory_url, result[:url]
    assert_equal 'Staff', result[:title]
    assert_equal 'TEACHER@example.edu', result[:email]
  end

  test 'does not match an email embedded in a different address' do
    document = Nokogiri::HTML('<html><body>not.teacher@example.edu</body></html>')
    stub_directory(directory_url, document)

    result = Services::TeacherDirectoryVerification::DirectoryLookup.call(
      school: school,
      email: 'teacher@example.edu',
    )

    assert_nil result
  end

  test 'does not match email hidden in a script' do
    document = Nokogiri::HTML('<html><body><script>teacher@example.edu</script></body></html>')
    stub_directory(directory_url, document)

    result = Services::TeacherDirectoryVerification::DirectoryLookup.call(
      school: school,
      email: 'teacher@example.edu',
    )

    assert_nil result
  end

  test 'accepts HTTPS URLs only when all resolved addresses are public' do
    Resolv.stubs(:getaddresses).with('directory.example.edu').returns(['93.184.216.34'])

    uri, address = Services::TeacherDirectoryVerification::DirectoryLookup.send(:safe_uri, directory_url)

    assert_equal 'https', uri.scheme
    assert_equal '93.184.216.34', address
    assert_nil Services::TeacherDirectoryVerification::DirectoryLookup.send(:safe_uri, 'http://directory.example.edu/staff')

    Resolv.stubs(:getaddresses).with('directory.example.edu').returns(['127.0.0.1'])
    assert_nil Services::TeacherDirectoryVerification::DirectoryLookup.send(:safe_uri, directory_url)
  end

  private def stub_directory(url, document)
    Services::TeacherDirectoryVerification::DirectoryLookup.stubs(:configured_urls).with(school).returns([url])
    Services::TeacherDirectoryVerification::DirectoryLookup.stubs(:fetch_document).with(url).returns(document)
  end
end
