require 'test_helper'

class AilabDatasetsTest < ActiveSupport::TestCase
  CSV = "Name,Legs\nRex,4\nTweety,2\n".freeze

  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @bundled_manifest = @dir.join('bundled-manifest.json')
    @bundled_manifest.write(
      {
        datasets: [
          {id: 'zoo', name: 'Zoo', path: 'datasets/zoo.csv', metadataPath: 'datasets/zoo.json', imagePath: 'datasets/zoo.jpg', rowCount: 101},
          {id: 'pets_toy', name: 'Pets', path: 'datasets/pets_toy.csv', metadataPath: 'datasets/pets_toy.json', isToy: true, rowCount: 8},
        ]
      }.to_json
    )
    AilabDatasets.stubs(:content_dir).returns(@dir.join('stored'))
    AilabDatasets.stubs(:bundled_manifest_file).returns(@bundled_manifest)
    AilabDatasets.reset_cache!
  end

  teardown do
    AilabDatasets.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "all gives the bundled datasets URLs when no dataset is stored" do
    assert_equal %w[zoo pets_toy], AilabDatasets.ids
    assert_equal(
      {
        'id' => 'zoo',
        'name' => 'Zoo',
        'path' => '/blockly/media/skins/ailab/datasets/zoo.csv',
        'metadataPath' => '/blockly/media/skins/ailab/datasets/zoo.json',
        'imagePath' => '/blockly/media/skins/ailab/datasets/zoo.jpg',
        'rowCount' => 101,
      },
      AilabDatasets.all.first
    )
    assert_nil AilabDatasets.stored('zoo')
  end

  test "save writes the files and the manifest entry" do
    save_dataset('birds', name: 'Birds', is_toy: true)

    assert_equal CSV, AilabDatasets.csv_file('birds').read
    assert_equal({'name' => 'birds', 'card' => {'source' => 'A test'}}, JSON.parse(AilabDatasets.metadata_file('birds').read))
    assert_equal(
      {'datasets' => [{'id' => 'birds', 'name' => 'Birds', 'isToy' => true, 'rowCount' => 2}]},
      JSON.parse(@dir.join('stored', 'manifest.json').read)
    )
  end

  test "a stored dataset has URLs that change when its files change" do
    save_dataset('birds')
    time = Time.at(1_700_000_000)
    File.utime(time, time, AilabDatasets.csv_file('birds'))
    File.utime(time, time, AilabDatasets.metadata_file('birds'))

    assert_equal(
      {
        'id' => 'birds',
        'name' => 'Birds',
        'rowCount' => 2,
        'path' => '/ailab_datasets/birds/csv?v=1700000000',
        'metadataPath' => '/ailab_datasets/birds/metadata?v=1700000000',
      },
      AilabDatasets.stored('birds')
    )
    assert_equal %w[zoo pets_toy birds], AilabDatasets.ids
  end

  test "a stored dataset replaces the bundled dataset with the same ID" do
    save_dataset('zoo', name: 'New Zoo')

    assert_equal %w[pets_toy zoo], AilabDatasets.ids
    assert_equal 'New Zoo', AilabDatasets.all.last['name']
    assert_match %r{\A/ailab_datasets/zoo/csv\?v=\d+\z}, AilabDatasets.all.last['path']
  end

  test "save replaces the entry of a dataset that is stored and keeps the manifest in ID order" do
    save_dataset('birds')
    save_dataset('ants')
    save_dataset('birds', name: 'More Birds', is_toy: true)

    entries = JSON.parse(@dir.join('stored', 'manifest.json').read)['datasets']
    assert_equal(
      [
        {'id' => 'ants', 'name' => 'Birds', 'rowCount' => 2},
        {'id' => 'birds', 'name' => 'More Birds', 'isToy' => true, 'rowCount' => 2},
      ],
      entries
    )
  end

  test "a file path raises for an ID that is not valid" do
    assert_raises(ArgumentError) {AilabDatasets.csv_file('../zoo')}
    assert_raises(ArgumentError) {AilabDatasets.metadata_file('zoo toy')}
    assert_raises(ArgumentError) {AilabDatasets.csv_file(nil)}
  end

  private def save_dataset(id, name: 'Birds', is_toy: false)
    AilabDatasets.save(id: id, name: name, is_toy: is_toy, row_count: 2, csv: CSV, metadata: {'name' => id, 'card' => {'source' => 'A test'}})
  end
end
