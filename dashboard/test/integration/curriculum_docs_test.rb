require 'test_helper'

class CurriculumDocsTest < ActionDispatch::IntegrationTest
  class CurriculumDocsRoutingTest < CurriculumDocsTest
    test '/docs/applab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'applab'},
        {path: "http://#{CDO.dashboard_hostname}/docs/applab", method: :get}
      )
    end

    test '/docs/gamelab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'gamelab'},
        {path: "http://#{CDO.dashboard_hostname}/docs/gamelab", method: :get}
      )
    end

    test '/docs/spritelab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'spritelab'},
        {path: "http://#{CDO.dashboard_hostname}/docs/spritelab", method: :get}
      )
    end

    test '/docs/weblab is routed to ProgrammingEnvironmentsController' do
      assert_recognizes(
        {controller: 'programming_environments', action: 'docs_show', programming_environment_name: 'weblab'},
        {path: "http://#{CDO.dashboard_hostname}/docs/weblab", method: :get}
      )
    end

    test '/docs/concepts is routed to CurriculumProxyController' do
      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'concepts'},
        {path: "http://#{CDO.dashboard_hostname}/docs/concepts", method: :get}
      )

      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'concepts/gamelab'},
        {path: "http://#{CDO.dashboard_hostname}/docs/concepts/gamelab", method: :get}
      )
    end

    test 'other /docs routes are routed to CurriculumProxyController' do
      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'csd-1718/html-tags'},
        {path: "http://#{CDO.dashboard_hostname}/docs/csd-1718/html-tags", method: :get}
      )

      assert_recognizes(
        {controller: 'curriculum_proxy', action: 'get_doc', path: 'csd/timed-loop/index', format: 'html'},
        {path: "http://#{CDO.dashboard_hostname}/docs/csd/timed-loop/index.html", method: :get}
      )
    end

    test '/docs/applab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'applab', programming_expression_key: 'button'},
        {path: "http://#{CDO.dashboard_hostname}/docs/applab/button", method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'applab', programming_expression_key: 'button'},
        {path: "http://#{CDO.dashboard_hostname}/docs/applab/button/index.html", method: :get}
      )
    end

    test '/docs/gamelab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'gamelab', programming_expression_key: 'draw'},
        {path: "http://#{CDO.dashboard_hostname}/docs/gamelab/draw", method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'gamelab', programming_expression_key: 'draw'},
        {path: "http://#{CDO.dashboard_hostname}/docs/gamelab/draw/index.html", method: :get}
      )
    end

    test '/docs/spritelab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'spritelab', programming_expression_key: 'gamelab_turn'},
        {path: "http://#{CDO.dashboard_hostname}/docs/spritelab/gamelab_turn", method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'spritelab', programming_expression_key: 'gamelab_turn'},
        {path: "http://#{CDO.dashboard_hostname}/docs/spritelab/gamelab_turn/index.html", method: :get}
      )
    end

    test '/docs/weblab/<key> is routed to ProgrammingExpressionsController' do
      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'weblab', programming_expression_key: 'style'},
        {path: "http://#{CDO.dashboard_hostname}/docs/weblab/style", method: :get}
      )

      assert_recognizes(
        {controller: 'programming_expressions', action: 'docs_show', programming_environment_name: 'weblab', programming_expression_key: 'style'},
        {path: "http://#{CDO.dashboard_hostname}/docs/weblab/style/index.html", method: :get}
      )
    end
  end

  class CodeDocsCachingTest < CurriculumDocsTest
    def setup
      Unit.stubs(:should_cache?).returns true
      @programming_environment = create :programming_environment
      programming_environment_category = create :programming_environment_category, programming_environment: @programming_environment
      @programming_expression = create :programming_expression, programming_environment: @programming_environment, programming_environment_category: programming_environment_category
      @programming_class = create :programming_class, programming_environment: @programming_environment, programming_environment_category: programming_environment_category
      create :programming_method, programming_class: @programming_class
    end

    test "environment index should cache all queries" do
      assert_cached_queries(0) do
        get programming_environments_path
      end
      assert_response :success
    end

    test "environment show should cache all queries" do
      assert_cached_queries(0) do
        get programming_environment_path(@programming_environment.name)
      end
      assert_response :success
    end

    test "expression show should cache all queries" do
      assert_cached_queries(0) do
        get programming_environment_programming_expression_path(@programming_environment.name, @programming_expression.key)
      end
      assert_response :success
    end

    test "class show should cache all queries" do
      assert_cached_queries(0) do
        get programming_environment_programming_class_path(@programming_environment.name, @programming_class.key)
      end
      assert_response :success
    end

    test "environment get_summary_by_name should cache all queries" do
      assert_cached_queries(0) do
        get get_summary_by_name_programming_environment_path(@programming_environment.name)
      end
      assert_response :success
    end
  end

  class CodeDocsQueryCountTest < CurriculumDocsTest
    def setup
      Unit.stubs(:should_cache?).returns false
      @programming_environment = create :programming_environment
      programming_environment_category = create :programming_environment_category, programming_environment: @programming_environment
      @programming_expression = create :programming_expression, programming_environment: @programming_environment, programming_environment_category: programming_environment_category
      @programming_class = create :programming_class, programming_environment: @programming_environment, programming_environment_category: programming_environment_category
      create :programming_method, programming_class: @programming_class
    end

    test "signed out environment index query count" do
      assert_queries(1) do
        get programming_environments_path
      end
      assert_response :success
    end

    test "signed out environment show query count" do
      assert_queries(8) do
        get programming_environment_path(@programming_environment.name)
      end
      assert_response :success
    end

    test "signed out expression show query count" do
      assert_queries(9) do
        get programming_environment_programming_expression_path(@programming_environment.name, @programming_expression.key)
      end
      assert_response :success
    end

    test "signed out class show query count" do
      assert_queries(11) do
        get programming_environment_programming_class_path(@programming_environment.name, @programming_class.key)
      end
      assert_response :success
    end

    test "environment get_summary_by_name query count" do
      assert_queries(8) do
        get get_summary_by_name_programming_environment_path(@programming_environment.name)
      end
      assert_response :success
    end
  end
end
