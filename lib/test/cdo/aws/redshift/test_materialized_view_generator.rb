require_relative '../../../test_helper'
require_relative '../../../../cdo/aws/redshift/materialized_view_generator'
require 'erb'

module Cdo
  module Aws
    module Redshift
      describe MaterializedViewGenerator do
        def mock_column(name, type)
          col = stub
          col.stubs(:name).returns(name)
          col.stubs(:type).returns(type)
          col
        end

        let(:id_col)         {mock_column('id', :integer)}
        let(:name_col)       {mock_column('name', :string)}
        let(:email_col)      {mock_column('email', :string)}
        let(:bio_col)        {mock_column('bio', :text)}
        let(:age_col)        {mock_column('age', :integer)}
        let(:is_admin_col)   {mock_column('is_admin', :boolean)}
        let(:score_col)      {mock_column('score', :float)}
        let(:created_at_col) {mock_column('created_at', :datetime)}
        let(:updated_at_col) {mock_column('updated_at', :datetime)}
        let(:deleted_at_col) {mock_column('deleted_at', :datetime)}
        let(:last_login_col) {mock_column('last_login', :datetime)}
        let(:birthday_col)   {mock_column('birthday', :date)}

        let(:all_columns) {[id_col, name_col, email_col, bio_col, age_col, is_admin_col, score_col, created_at_col, updated_at_col, deleted_at_col, last_login_col, birthday_col]}

        let(:model) {stub}

        before do
          model.stubs(:table_name).returns('users')
          model.stubs(:primary_key).returns('id')
          model.stubs(:columns).returns(all_columns)
        end

        describe '#generate_pii_ddl' do
          it 'includes all columns in the SELECT clause' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            all_columns.each {|col| assert_includes ddl, col.name}
          end

          it 'uses ERB template variable in the pii schema name' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'dashboard_<%=environment_type%>_pii.zeroetl_users'
          end

          it 'uses ERB template variables in the source table path' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, '<%=environment_type%>_learningplatform_mysql_zeroetl.dashboard_<%=environment_type%>.users'
          end

          it 'uses the primary key as the distkey' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
          end

          it 'disables backup and automated refresh' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'BACKUP NO'
            assert_includes ddl, 'AUTO REFRESH NO'
          end

          it 'returns nil when the model has no columns' do
            model.stubs(:columns).returns([])
            assert_nil MaterializedViewGenerator.new(model).generate_pii_ddl
          end

          it 'renders to the correct production schema when ERB is evaluated' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            environment_type = 'production'
            rendered = ERB.new(ddl).result(binding)
            assert_includes rendered, 'dashboard_production_pii.zeroetl_users'
            assert_includes rendered, 'production_learningplatform_mysql_zeroetl.dashboard_production.users'
          end
        end

        describe '#generate_non_pii_ddl' do
          let(:generator) {MaterializedViewGenerator.new(model)}

          it 'excludes string columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'name'
            refute_includes ddl, 'email'
          end

          it 'excludes text columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'bio'
          end

          it 'excludes non-allowlisted datetime columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'last_login'
          end

          it 'excludes non-allowlisted date columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'birthday'
          end

          it 'includes allowlisted datetime columns (created_at, updated_at, deleted_at)' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'created_at'
            assert_includes ddl, 'updated_at'
            assert_includes ddl, 'deleted_at'
          end

          it 'includes non-text, non-date columns (integer, boolean, float)' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'id'
            assert_includes ddl, 'age'
            assert_includes ddl, 'is_admin'
            assert_includes ddl, 'score'
          end

          it 'uses ERB template variable in the non-pii schema name' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'dashboard_<%=environment_type%>.zeroetl_users'
            refute_includes ddl, '_pii'
          end

          it 'disables backup and automated refresh' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'BACKUP NO'
            assert_includes ddl, 'AUTO REFRESH NO'
          end

          it 'returns nil when there are no non-pii columns' do
            model.stubs(:columns).returns([name_col, bio_col])
            assert_nil generator.generate_non_pii_ddl
          end
        end

        describe '#distkey_column (via generated DDL)' do
          it 'uses the first element of a composite primary key' do
            model.stubs(:primary_key).returns(%w[user_id activity_id])
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (user_id)'
          end

          it 'falls back to id when primary_key is nil' do
            model.stubs(:primary_key).returns(nil)
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
          end

          it 'falls back to id when primary_key is blank' do
            model.stubs(:primary_key).returns('')
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
          end
        end
      end
    end
  end
end
