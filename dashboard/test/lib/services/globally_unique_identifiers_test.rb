require 'test_helper'

class Services::GloballyUniqueIdentifiersTest < ActiveSupport::TestCase
  test 'build_key_re' do
    module Foo
      KEY_CHAR_RE = /f/
    end

    basic_re = Services::GloballyUniqueIdentifiers.build_key_re([Foo])
    # see https://stackoverflow.com/a/34026971/1810460 for an explanation of `?-mix`
    assert_equal(/(?<Foo>(?-mix:f)+)/, basic_re)
    assert_match(basic_re, "ffffffff")

    module Bar
      KEY_CHAR_RE = /b/
    end

    assert_equal(/(?<Foo>(?-mix:f)+)\/(?<Bar>(?-mix:b)+)/, Services::GloballyUniqueIdentifiers.build_key_re([Foo, Bar]))
    assert_equal(/(?<Bar>(?-mix:b)+)\/(?<Foo>(?-mix:f)+)/, Services::GloballyUniqueIdentifiers.build_key_re([Bar, Foo]))
  end

  test 'build_vocab_key' do
    course_offering = create :course_offering, key: 'test-course'
    course_version = create :course_version,
      course_offering: course_offering,
      key: '1999'
    vocabulary = create :vocabulary,
      key: 'example_vocab',
      word: "Example Vocabulary",
      definition: "An example vocabulary entry for testing",
      course_version: course_version

    assert_equal 'example_vocab/test-course/1999',
      Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary)
  end

  test 'build_resource_key' do
    course_offering = create :course_offering, key: 'test-course'
    course_version = create :course_version,
      course_offering: course_offering,
      key: '1999'
    resource = create :resource,
      key: 'example-resource',
      name: "Example Resource",
      url: "example.com",
      course_version: course_version

    assert_equal 'example-resource/test-course/1999',
      Services::GloballyUniqueIdentifiers.build_resource_key(resource)
  end
end
