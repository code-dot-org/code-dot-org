require 'test_helper'

class Weblab2Test < ActiveSupport::TestCase
  test 'hiding the resource panel needs one of the widget views' do
    level = build(:weblab2, widget_view_hide_resource_panel: 'true')
    refute level.valid?
    assert_equal ['only applies when Widget View or Widget2 View is on.'], level.errors[:widget_view_hide_resource_panel]
  end

  test 'hiding the resource panel is fine with widget view on' do
    assert build(:weblab2, widget_view: 'true', widget_view_hide_resource_panel: 'true').valid?
  end

  test 'hiding the resource panel is fine with a widget2' do
    assert build(:weblab2, widget2: {'id' => 'some-widget'}, widget_view_hide_resource_panel: 'true').valid?
  end

  test 'not hiding the resource panel needs no widget view' do
    assert build(:weblab2, widget_view_hide_resource_panel: 'false').valid?
    assert build(:weblab2).valid?
  end
end
