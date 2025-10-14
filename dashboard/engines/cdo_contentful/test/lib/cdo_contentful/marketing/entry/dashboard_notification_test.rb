# frozen_string_literal: true

require 'test_helper'

describe CdoContentful::Marketing::Entry::DashboardNotification do
  describe '.find_each' do
    subject {->(&blk) {CdoContentful::Marketing::Entry::DashboardNotification.find_each(locale:, limit:, &blk)}}

    let(:locale) {'en-US'}
    let(:limit) {2}

    it 'yields correct DashboardNotification entries' do
      VCR.use_cassette("marketing/entries/dashboard_notifications") do
        yielded_entries_count = 0

        subject.call do |entry|
          _(entry).must_be_instance_of Contentful::Entry
          _(entry.content_type.id).must_equal 'dashboard-notification'
        ensure
          yielded_entries_count += 1
        end

        _(yielded_entries_count).must_equal 4
      end
    end

    it 'returns number of yielded DashboardNotification entries' do
      VCR.use_cassette("marketing/entries/dashboard_notifications") do
        _(subject.call {}).must_equal 4
      end
    end
  end
end
