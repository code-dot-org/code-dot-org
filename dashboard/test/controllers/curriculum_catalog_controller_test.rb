require 'test_helper'

class CurriculumCatalogControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # Remove any test fixtures so the catalog contains only the offerings built below.
    CourseOffering.destroy_all

    # #index reads request.country, which otherwise falls through to a geocoder lookup.
    # See Cdo::Rack::Request#country.
    request.env['HTTP_CLOUDFRONT_VIEWER_COUNTRY'] = 'US'
  end

  test 'catalog lists featured offerings before non-featured ones' do
    non_featured = create_catalog_course_offering('apple-coding', 'Apple Coding', is_featured: false)
    featured = create_catalog_course_offering('zebra-science', 'Zebra Science', is_featured: true)

    get :index

    assert_response :success
    assert_equal [featured.key, non_featured.key], catalog_keys
  end

  test 'catalog sorts alphabetically by display name within the featured and non-featured groups' do
    featured_b = create_catalog_course_offering('featured-b', 'B', is_featured: true)
    featured_a = create_catalog_course_offering('featured-a', 'A', is_featured: true)
    non_featured_d = create_catalog_course_offering('not-featured-d', 'D', is_featured: false)
    non_featured_c = create_catalog_course_offering('not-featured-c', 'C', is_featured: false)

    get :index

    assert_response :success
    assert_equal(
      [featured_a.key, featured_b.key, non_featured_c.key, non_featured_d.key],
      catalog_keys
    )
  end

  test 'catalog is alphabetical when nothing is featured' do
    second = create_catalog_course_offering('second', 'B', is_featured: false)
    first = create_catalog_course_offering('first', 'A', is_featured: false)

    get :index

    assert_response :success
    assert_equal [first.key, second.key], catalog_keys
  end

  # Builds a course offering that CourseOffering.assignable_published_for_students_course_offerings
  # will return: assignable, with a published version, for a student participant audience.
  private def create_catalog_course_offering(key, display_name, is_featured:)
    course_version = create(:course_version)
    course_version.content_root.update!(published_state: 'stable')
    course_version.course_offering.update!(
      key: key,
      display_name: display_name,
      is_featured: is_featured
    )
    course_version.course_offering
  end

  private def catalog_keys
    assigns(:catalog_data)[:curriculaData].pluck(:key)
  end
end
