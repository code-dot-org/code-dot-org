# frozen_string_literal: true

require 'test_helper'

describe CdoContentful::Marketing::Entry::TeacherHomepageSidebar do
  describe '.find' do
    subject {CdoContentful::Marketing::Entry::TeacherHomepageSidebar.find(entry_id)}

    let(:entry_id) {'55R4y1NlZ0qJG9O0qgyq0Q'}

    it 'returns correct TeacherHomepageSidebar entry' do
      VCR.use_cassette("marketing/entries/teacher_homepage_sidebars/#{entry_id}") do
        _(subject).must_be_instance_of Contentful::Entry
        _(subject.content_type.id).must_equal 'teacherHomepageSidebar'
        _(subject.id).must_equal entry_id

        subject.sidebar_ads.each do |sidebar_ad|
          _(sidebar_ad).must_be_instance_of Contentful::Entry
          _(sidebar_ad.content_type.id).must_equal 'teacherHomepageAds'
        end
      end
    end
  end
end
