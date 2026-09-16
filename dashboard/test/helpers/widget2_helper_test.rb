require 'test_helper'

class Widget2HelperTest < ActiveSupport::TestCase
  include Widget2Helper

  setup do
    @base = Dir.mktmpdir
    FileUtils.mkdir_p("#{@base}/mywidget/assets")
    File.write("#{@base}/mywidget/index.html", '<p>hello</p>')
    File.write("#{@base}/mywidget/style.css", 'p {color: red;}')
    File.write("#{@base}/mywidget/README.md", 'notes')
    File.write("#{@base}/mywidget/assets/otter.jpg", 'JPEGDATA')
    File.write("#{@base}/mywidget/assets/coin.js", 'flip();')
    File.write("#{@base}/mywidget/secrets.rb", 'nope')
    File.write("#{@base}/README.md", 'library notes')
  end

  teardown do
    FileUtils.remove_entry @base
  end

  test 'reads text sources inline and assets by URL, one folder deep' do
    Widget2Helper.stub_const(:WIDGET2_BASE_DIRECTORY, @base) do
      sources = get_widget2_sources('mywidget')
      files = sources[:files].values

      assert_equal(['assets'], sources[:folders].values.pluck(:name))
      assets_folder_id = sources[:folders].values.first[:id]

      index = files.find {|file| file[:name] == 'index.html'}
      assert_equal '<p>hello</p>', index[:contents]
      assert_equal WIDGET2_ROOT_FOLDER_ID, index[:folderId]
      assert index[:active]

      otter = files.find {|file| file[:name] == 'otter.jpg'}
      assert_equal '/widget2/mywidget/assets/otter.jpg', otter[:url]
      assert_nil otter[:contents]
      assert_equal assets_folder_id, otter[:folderId]

      coin = files.find {|file| file[:name] == 'coin.js'}
      assert_equal 'flip();', coin[:contents]
      assert_equal assets_folder_id, coin[:folderId]

      assert_nil(files.find {|file| file[:name] == 'secrets.rb'})
      assert_equal %w[README.md coin.js index.html style.css], files.select {|file| file.key?(:contents)}.pluck(:name).sort
      assert_equal files.select {|file| file.key?(:contents)}.pluck(:id), sources[:openFiles]
    end
  end

  test 'a widget2 with no files returns nil' do
    Widget2Helper.stub_const(:WIDGET2_BASE_DIRECTORY, @base) do
      FileUtils.mkdir_p("#{@base}/empty")
      assert_nil get_widget2_sources('empty')
      assert_nil get_widget2_sources('nosuchwidget')
    end
  end

  test 'lists only directories with valid ids' do
    Widget2Helper.stub_const(:WIDGET2_BASE_DIRECTORY, @base) do
      FileUtils.mkdir_p("#{@base}/Bad Name")
      assert_equal ['mywidget'], get_widget2_ids
    end
  end

  test 'resolves asset paths inside the tree only' do
    Widget2Helper.stub_const(:WIDGET2_BASE_DIRECTORY, @base) do
      assert_equal "#{@base}/mywidget/assets/otter.jpg", widget2_asset_path('mywidget', 'assets/otter.jpg')
      assert_nil widget2_asset_path('mywidget', 'index.html'), 'text sources are not assets'
      assert_nil widget2_asset_path('mywidget', 'assets/nope.jpg')
      assert_nil widget2_asset_path('mywidget', '../mywidget/assets/otter.jpg')
      assert_nil widget2_asset_path('mywidget', 'a/b/otter.jpg'), 'one folder deep only'
      assert_nil widget2_asset_path('../mywidget', 'assets/otter.jpg')
    end
  end
end
