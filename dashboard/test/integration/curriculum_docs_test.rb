require 'test_helper'

class CurriculumDocsTest < ActionDispatch::IntegrationTest
  class CurriculumDocsRoutingTest < CurriculumDocsTest
    test '/docs/applab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'applab'},
        {path: '/docs/applab', method: :get}
      )
    end

    test '/docs/gamelab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'gamelab'},
        {path: '/docs/gamelab', method: :get}
      )
    end

    test '/docs/spritelab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'spritelab'},
        {path: '/docs/spritelab', method: :get}
      )
    end

    test '/docs/weblab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'weblab'},
        {path: '/docs/weblab', method: :get}
      )
    end

    test '/docs/concepts is routed to CurriculumProxyController' do
      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'concepts'},
        {path: '/docs/concepts', method: :get}
      )

      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'concepts/gamelab'},
        {path: '/docs/concepts/gamelab', method: :get}
      )
    end

    test 'other /docs routes are routed to CurriculumProxyController' do
      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'csd-1718/html-tags'},
        {path: '/docs/csd-1718/html-tags', method: :get}
      )

      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'csd/timed-loop/index', format: 'html'},
        {path: '/docs/csd/timed-loop/index.html', method: :get}
      )
    end

    test '/docs/applab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'applab', programming_expression_key: 'button'},
        {path: '/docs/applab/button', method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'applab', programming_expression_key: 'button'},
        {path: '/docs/applab/button/index.html', method: :get}
      )
    end

    test '/docs/gamelab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'gamelab', programming_expression_key: 'draw'},
        {path: '/docs/gamelab/draw', method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'gamelab', programming_expression_key: 'draw'},
        {path: '/docs/gamelab/draw/index.html', method: :get}
      )
    end

    test '/docs/spritelab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'spritelab', programming_expression_key: 'gamelab_turn'},
        {path: '/docs/spritelab/gamelab_turn', method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'spritelab', programming_expression_key: 'gamelab_turn'},
        {path: '/docs/spritelab/gamelab_turn/index.html', method: :get}
      )
    end

    test '/docs/weblab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'weblab', programming_expression_key: 'style'},
        {path: '/docs/weblab/style', method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'weblab', programming_expression_key: 'style'},
        {path: '/docs/weblab/style/index.html', method: :get}
      )
    end
  end

  class CodeDocsCachingTest < CurriculumDocsTest
    def setup
      Script.stubs(:should_cache?).returns true
      @programming_environment = create :programming_environment
      programming_environment_category = create :programming_environment_category, programming_environment: @programming_environment
      @programming_expression = create :programming_expression, programming_environment: @programming_environment, programming_environment_category: programming_environment_category
    end

    test "docs index should cache all queries" do
      assert_cached_queries(0) do
        get '/programming_environments'
      end
      assert_response :success
    end

    test "docs ide show should cache all queries" do
      assert_cached_queries(0) do
        get "/programming_environments/#{@programming_environment.name}"
      end
      assert_response :success
    end

    test "docs expression show should cache all queries" do
      assert_cached_queries(0) do
        get "/programming_environments/#{@programming_environment.name}/programming_expressions/#{@programming_expression.key}"
      end
      assert_response :success
    end
  end
end
