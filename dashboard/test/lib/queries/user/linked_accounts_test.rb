require 'test_helper'

class Queries::User::LinkedAccountsTest < ActiveSupport::TestCase
  let(:user) {create(:teacher)}
  let(:result) {Queries::User::LinkedAccounts.call(user: user)}

  def create_classlink_option(version:, authentication_id:, created_at: Time.zone.now)
    create(
      :authentication_option,
      user: user,
      email: user.email,
      hashed_email: user.hashed_email,
      credential_type: AuthenticationOption::CLASSLINK,
      authentication_id: authentication_id,
      version: version,
      created_at: created_at
    )
  end

  def create_v1_option(created_at: Time.zone.now)
    create_classlink_option(version: nil, authentication_id: rand(10_000_000..99_999_999).to_s, created_at: created_at)
  end

  def create_v2_option(created_at: Time.zone.now)
    create_classlink_option(
      version: AuthenticationOption::Classlink::VERSION[:v2],
      authentication_id: "tenant|#{SecureRandom.uuid}",
      created_at: created_at
    )
  end

  test 'returns every option when none is ClassLink' do
    google = create(:google_authentication_option, user: user)
    user.reload

    assert_equal user.authentication_options.to_a.sort_by(&:id), result.sort_by(&:id)
    assert_includes result, google
  end

  test 'keeps a lone v1 ClassLink option' do
    v1 = create_v1_option
    user.reload

    assert_includes result, v1
  end

  test 'keeps a lone v2 ClassLink option' do
    v2 = create_v2_option
    user.reload

    assert_includes result, v2
  end

  test 'lists only the v2 option when the user holds both v1 and v2' do
    v1 = create_v1_option(created_at: 1.day.ago)
    v2 = create_v2_option
    user.reload

    assert_includes result, v2
    refute_includes result, v1
    classlink_rows = result.select {|option| option.credential_type == AuthenticationOption::CLASSLINK}
    assert_equal 1, classlink_rows.size
  end

  test 'prefers the v2 option even when the v1 option is newer' do
    v2 = create_v2_option(created_at: 1.day.ago)
    v1 = create_v1_option
    user.reload

    assert_includes result, v2
    refute_includes result, v1
  end

  test 'lists only the newest v2 option when the user holds several' do
    older_v2 = create_v2_option(created_at: 2.days.ago)
    newer_v2 = create_v2_option(created_at: 1.day.ago)
    v1 = create_v1_option
    user.reload

    assert_includes result, newer_v2
    refute_includes result, older_v2
    refute_includes result, v1
  end

  test 'leaves non-ClassLink options untouched while collapsing ClassLink' do
    google = create(:google_authentication_option, user: user)
    create_v1_option
    v2 = create_v2_option
    user.reload

    assert_includes result, google
    assert_includes result, v2
    assert_includes result, user.primary_contact_info
    assert_equal 3, result.size
  end
end
