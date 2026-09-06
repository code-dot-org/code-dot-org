require 'test_helper'

class SpritelabLab2ImagesReviewControllerTest < ActionController::TestCase
  setup_all do
    @project_validator = create(:project_validator)
    @levelbuilder = create(:levelbuilder)
    @student = create(:student)
  end

  test 'signed out is redirected to sign in' do
    get :index
    assert_response :redirect
  end

  test 'student is forbidden' do
    sign_in @student
    get :index
    assert_response :forbidden
  end

  test 'levelbuilder without project_validator is forbidden' do
    sign_in @levelbuilder
    get :index
    assert_response :forbidden
  end

  test 'project validator gets the page' do
    sign_in @project_validator
    get :index
    assert_response :success
  end

  test 'a lab2 project is listed with its generated images' do
    level = create(:spritelab, name: 'lab2 images test level')
    level.properties['uses_lab2'] = 'true'
    level.save!
    project = create(:project)
    ChannelToken.create!(
      level: level,
      storage_app_id: project.id,
      storage_id: project.storage_id
    )

    SpritelabLab2GeneratedAssets.any_instance.stubs(:generated_files).returns(
      [
        {filename: 'generated-abc.png', version_id: 'v1', last_modified: Time.now},
        {filename: 'generated-old.png', version_id: 'v0', last_modified: Time.now - 60},
      ]
    )
    manifest = {
      animations: {
        propsByKey: {
          key1: {
            name: 'Wizard',
            sourceUrl: "/v3/assets/#{project.channel_id}/generated-abc.png",
            generation: {prompt: 'a friendly wizard', imageType: 'sprite', style: 'pixel'},
          },
        },
      },
    }.to_json
    SourceBucket.any_instance.stubs(:get).returns({status: 'FOUND', body: StringIO.new(manifest)})
    SourceBucket.any_instance.stubs(:list_versions).returns([])

    sign_in @project_validator
    get :index
    assert_response :success
    assert_includes response.body, 'a friendly wizard'
    assert_includes response.body, 'generated-abc.png?version=v1'
    assert_includes response.body, 'generated-old.png?version=v0'
    assert_includes response.body, 'discarded'
    assert_includes response.body, "/projects/spritelab/#{project.channel_id}/view"
  end
end
