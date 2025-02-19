require 'test_helper'

class RobotsControllerTest < ActionController::TestCase
  test 'renders plaintext' do
    set_env :production
    post :index
    assert_response :success
    expect(response.content_type.split(';').first).to eq('text/plain')
  end

  test 'targets all crawlers' do
    set_env :production
    post :index
    assert_response :success
    let(:lines) {response.body.lines(chomp: true)}
    expect(lines).to include('User-agent: *')
  end

  test 'denies all for non production environment' do
    set_env :levelbuilder
    post :index
    assert_response :success
    let(:lines) {response.body.lines(chomp: true)}
    expect(lines).to include('Disallow: /')
  end

  test 'allows all for production with a couple exceptions' do
    set_env :production
    post :index
    assert_response :success
    let(:lines) {response.body.lines(chomp: true)}
    expect(lines).to include('Allow: /$')
    expect(lines).to include('Disallow: /projects/')
  end
end
