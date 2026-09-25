require 'test_helper'

class AdaptiveContentTest < ActiveSupport::TestCase
  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    AdaptiveContent.stubs(:content_dir).returns(@dir)
    AdaptiveContent.reset_cache!
    write_content('alpha', {'title' => 'Alpha'})
    write_content('beta-2', {'title' => 'Beta'})
    @dir.join('Not Valid.json').write('{}')
  end

  teardown do
    AdaptiveContent.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "ids lists only valid file basenames, sorted" do
    assert_equal %w[alpha beta-2], AdaptiveContent.ids
  end

  test "exist? rejects ids outside the pattern before touching the filesystem" do
    refute AdaptiveContent.exist?('../alpha')
    refute AdaptiveContent.exist?('Not Valid')
    refute AdaptiveContent.exist?(nil)
    assert AdaptiveContent.exist?('alpha')
  end

  test "path raises for an invalid id" do
    assert_raises(ArgumentError) {AdaptiveContent.path('../alpha')}
  end

  test "load returns nil for a missing id" do
    assert_nil AdaptiveContent.load('missing')
    assert_nil AdaptiveContent.load('../alpha')
  end

  test "load resolves each skill's standards, passing unknown ones through" do
    framework = create(:framework, shortcode: 'fw', name: 'Fake Framework')
    create(:standard, framework: framework, shortcode: 'FW-1', description: 'Do the thing')
    write_content('standardized', {
                    'skills' => {
                      'prompting' => {
                        'id' => 'prompting',
                        'standards' => [{'framework' => 'fw', 'shortcode' => 'FW-1'}, {'framework' => 'fw', 'shortcode' => 'NOPE'}],
                      },
                      'plain' => {'id' => 'plain'},
                    },
                  }
)

    loaded = AdaptiveContent.load('standardized')

    assert_equal(
      [
        {'framework' => 'fw', 'shortcode' => 'FW-1', 'frameworkName' => 'Fake Framework', 'description' => 'Do the thing'},
        {'framework' => 'fw', 'shortcode' => 'NOPE'},
      ],
      loaded['skills']['prompting']['standards']
    )
    assert_equal({'id' => 'plain'}, loaded['skills']['plain'])
  end

  test "load leaves the cached parse untouched when resolving standards" do
    create(:standard, framework: create(:framework, shortcode: 'fw'), shortcode: 'FW-1')
    write_content('cached', {'skills' => {'s' => {'id' => 's', 'standards' => [{'framework' => 'fw', 'shortcode' => 'FW-1'}]}}})

    AdaptiveContent.load('cached')
    assert AdaptiveContent.load('cached')['skills']['s']['standards'].first.key?('frameworkName')
    refute AdaptiveContent.send(:read, AdaptiveContent.path('cached'))['skills']['s']['standards'].first.key?('frameworkName')
  end

  test "load of a pathway without skills is returned as written" do
    assert_equal({'title' => 'Alpha'}, AdaptiveContent.load('alpha'))
  end

  test "load parses and caches until the file's mtime changes" do
    assert_equal 'Alpha', AdaptiveContent.load('alpha')['title']

    # Same mtime: the cached parse is returned even though the bytes changed.
    file = @dir.join('alpha.json')
    mtime = File.mtime(file)
    file.write({'title' => 'Alpha v2'}.to_json)
    File.utime(mtime, mtime, file)
    assert_equal 'Alpha', AdaptiveContent.load('alpha')['title']

    File.utime(mtime + 60, mtime + 60, file)
    assert_equal 'Alpha v2', AdaptiveContent.load('alpha')['title']
  end

  private def write_content(id, hash)
    @dir.join("#{id}.json").write(hash.to_json)
  end
end
