require 'test_helper'

class ScrapbookEntryTest < ActiveSupport::TestCase
  setup do
    @user = create(:user)
  end

  def build_entry(attrs = {})
    ScrapbookEntry.new(
      {user_id: @user.id, channel_id: 'fake-channel', entry_text: {}}.merge(attrs)
    )
  end

  test 'accepts a bare uuid filename in the asset columns' do
    entry = build_entry(before_asset_url: 'a1b2c3d4-0000-1111-2222-333344445555.png')
    assert entry.valid?, entry.errors.full_messages.join(', ')
  end

  test 'rejects an asset value containing a path' do
    entry = build_entry(before_asset_url: '../../etc/passwd.png')
    refute entry.valid?
    assert entry.errors.key?(:before_asset_url)
  end

  test 'rejects an asset value with a disallowed extension' do
    entry = build_entry(after_asset_url: 'abc.svg')
    refute entry.valid?
  end

  test 'deletes the prior S3 image when an asset is replaced' do
    entry = build_entry(before_asset_url: 'aaaa.png')
    entry.save!

    Scrapbook::ImageStore.expects(:delete).with(@user.id, 'aaaa.png').once
    entry.update!(before_asset_url: 'bbbb.png')
  end

  test 'does not touch S3 when an unrelated field changes' do
    entry = build_entry(before_asset_url: 'aaaa.png')
    entry.save!

    Scrapbook::ImageStore.expects(:delete).never
    entry.update!(entry_text: {'note' => 'updated'})
  end

  test 'deletes both S3 images when the entry is destroyed' do
    entry = build_entry(before_asset_url: 'aaaa.png', after_asset_url: 'bbbb.png')
    entry.save!

    Scrapbook::ImageStore.expects(:delete).with(@user.id, 'aaaa.png').once
    Scrapbook::ImageStore.expects(:delete).with(@user.id, 'bbbb.png').once
    entry.destroy!
  end

  test 'cleanup failure does not block the destroy' do
    entry = build_entry(before_asset_url: 'aaaa.png')
    entry.save!

    Scrapbook::ImageStore.stubs(:delete).raises(StandardError, 'S3 down')
    assert_nothing_raised {entry.destroy!}
    refute ScrapbookEntry.exists?(entry.id)
  end
end
