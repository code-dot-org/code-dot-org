# frozen_string_literal: true

require 'test_helper'

describe CdoContentful::CsForAll::Entry::Tutorial do
  describe '.find_by_code' do
    subject {CdoContentful::CsForAll::Entry::Tutorial.find_by_code(tutorial_id)}

    let(:tutorial_id) {'poem_art'}

    it 'returns correct Tutorial entry' do
      VCR.use_cassette('entries/tutorials/poem_art') do
        _(subject).must_be_instance_of Contentful::Entry
        _(subject.content_type.id).must_equal 'curriculum'
        _(subject.tutorial_id).must_equal tutorial_id
        _(subject.primary_link_ref.primary_target).must_equal 'https://code.org/poetry'
        _(subject.secondary_link_ref.primary_target).must_equal 'https://studio.code.org/s/poem-art-2021/lessons/1'
      end
    end
  end
end
