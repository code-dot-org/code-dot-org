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
  #
  # Goes through add_course_offering rather than building the course version directly.
  # any_version_is_in_published_state? reads course_versions.published_state, which is a
  # column on that table rather than a delegation to the content root, and
  # CourseVersion.add_course_version is what copies the content root's state onto it.
  # Setting the content root's published_state alone leaves the course version
  # 'in_development' and the offering out of the catalog.
  private def create_catalog_course_offering(key, display_name, is_featured:)
    content_root = create(
      :single_unit_course,
      family_name: key,
      version_year: '1991',
      published_state: 'stable',
      instructor_audience: 'universal_instructor',
      participant_audience: 'student'
    )
    course_offering = CourseOffering.add_course_offering(content_root)
    course_offering.update!(display_name: display_name, is_featured: is_featured)
    course_offering
  end

  private def catalog_keys
    assigns(:catalog_data)[:curriculaData].pluck(:key)
  end
end
