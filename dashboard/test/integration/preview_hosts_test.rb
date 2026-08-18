require 'test_helper'

# The sandboxed preview hosts (Web Lab 2's HTML preview, Python Lab's pyodide
# sandbox) run student-controlled code, so they must be able to reach no other
# Rails route: every other path and method must 404 before any
# host-unconstrained dashboard route can match. (Rack middleware mounted ahead
# of routing — FilesApi and friends, /v3/... — is out of scope here; route
# order cannot constrain it.) Both the codeaiprojects.org (migration target)
# and codeprojects.org (pre-migration, current default) origins are served; the
# 'sandboxed-preview-domain' DCDO flag picks which one clients embed. See the
# preview host constraints at the top of config/routes.rb and
# docs/weblab-preview-domain-migration.md.
class PreviewHostsTest < ActionDispatch::IntegrationTest
  PREVIEW_HOSTS = [
    CDO.preview_codeaiprojects_hostname,
    CDO.preview_codeprojects_hostname,
  ].freeze

  test 'preview hosts serve the preview page at root' do
    PREVIEW_HOSTS.each do |preview_host|
      get "http://someproject.#{preview_host}/"
      assert_response :success, "expected the preview page on #{preview_host}"
      assert_includes response.body, 'codeprojects-preview-container'
    end
  end

  test 'preview hosts serve the project service worker from the root scope' do
    PREVIEW_HOSTS.each do |preview_host|
      get "http://someproject.#{preview_host}/weblab2_project_service_worker.js"
      assert_response :success, "expected the service worker on #{preview_host}"
      assert_equal 'application/javascript', response.media_type
    end
  end

  test 'pyodide sandbox is served on the fixed subdomain of each preview host' do
    PREVIEW_HOSTS.each do |preview_host|
      get "http://pyodide-sandbox.#{preview_host}/"
      assert_response :success, "expected the pyodide sandbox on #{preview_host}"
    end
  end

  test 'every other path 404s on preview hosts, including host-unconstrained routes' do
    PREVIEW_HOSTS.each do |preview_host|
      host = "someproject.#{preview_host}"

      # Matched by host-unconstrained routes on any other host.
      get "http://#{host}/robots.txt"
      assert_response :not_found, "expected /robots.txt to 404 on #{host}"
      get "http://#{host}/users/sign_up"
      assert_response :not_found, "expected /users/sign_up to 404 on #{host}"

      # Non-GET methods must be caught too.
      post "http://#{host}/anything"
      assert_response :not_found, "expected POST to 404 on #{host}"
    end
  end
end
