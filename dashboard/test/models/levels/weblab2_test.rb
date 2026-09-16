require 'test_helper'

class Weblab2Test < ActiveSupport::TestCase
  test 'level_name_for_widget2 derives the conventional name' do
    assert_equal 'widget2 my-widget', Widget2Helper.level_name_for_widget2('my-widget')
  end

  test 'level_name_for_widget2 rejects an id that would escape the widget2 tree' do
    assert_raises(ArgumentError) {Widget2Helper.level_name_for_widget2('../etc')}
    assert_raises(ArgumentError) {Widget2Helper.level_name_for_widget2('Foo')}
  end

  test 'widget2 level must use the conventional name' do
    level = build(:weblab2, name: 'some other name')
    level.widget2 = {'id' => 'my-widget'}
    refute level.valid?
    assert_match(/must be named "widget2 my-widget"/, level.errors[:widget2].join)
  end

  test 'widget2 level with the conventional name is valid' do
    level = build(:weblab2, name: 'widget2 my-widget')
    level.widget2 = {'id' => 'my-widget'}
    assert level.valid?
  end

  test 'widget2 level is not channel backed' do
    # Every viewer of an embedded widget, signed out included, would otherwise create a
    # ChannelToken that the level never writes to.
    level = build(:weblab2, name: 'widget2 my-widget')
    level.widget2 = {'id' => 'my-widget'}
    refute level.channel_backed?
  end

  test 'plain weblab2 level is still channel backed' do
    assert build(:weblab2, name: 'plain weblab2 level').channel_backed?
  end

  test 'summarize_for_lab2_properties serves a widget from repo sources' do
    level = build(:weblab2, name: 'widget2 my-widget')
    level.widget2 = {'id' => 'my-widget'}
    sources = {folders: {}, files: {}, openFiles: []}
    level.stubs(:get_widget2_sources).with('my-widget').returns(sources)

    properties = level.summarize_for_lab2_properties(nil)

    assert_equal sources, properties[:startSources]
    assert_equal false, properties[:usesProjects]
    assert_equal true, properties[:widgetView]
  end
end
