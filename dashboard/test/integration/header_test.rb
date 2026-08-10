require 'test_helper'

class HeaderTest < ActionDispatch::IntegrationTest
  context 'when signed out' do
    around do |test|
      get '/catalog'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', '//test.code.org'
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'Teachers'   => '//test.code.org/teachers',
          'Districts'  => '//test.code.org/districts',
          'Advocacy'   => 'https://advocacy.code.org',
          'Hour of AI' => '//test.code.org/hour-of-ai',
          'Parents'    => '//test.code.org/parents',
          'Students'   => '//test.code.org/students',
          'About'      => '//test.code.org/about',
          'Donate'     => '//test.code.org/donate'
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project links' do
        must_select '#header_create_menu[role="button"]', /New project/ do
          {
            'Sprite Lab'        => 'https://test-studio.code.org/projects/spritelab/new',
            'App Lab'           => 'https://test-studio.code.org/projects/applab/new',
            'Game Lab'          => 'https://test-studio.code.org/projects/gamelab/new',
            'Music Lab'         => '//test.code.org/music',
            'Dance Party'       => 'https://test-studio.code.org/projects/dance/new',
            'Sketch Lab'        => 'https://test-studio.code.org/projects/sketchlab/new',
            'Python Lab'        => 'https://test-studio.code.org/projects/pythonlab/new',
            'Web Lab (new)'     => 'https://test-studio.code.org/projects/weblab2/new',
            'Mix & Move with AI' => '//test.code.org/mix-move-ai',
            /View all projects/ => 'https://test-studio.code.org/projects'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders sign in button' do
        must_select '#signin_button[href=?]',
                    'https://test-studio.code.org/users/sign_in',
                    'Sign in'
      end

      it 'renders Sign in button' do
        must_select '#create_account_button[href=?]',
                    'https://test-studio.code.org/users/sign_up/account_type',
                    'Create account'
      end

      describe 'hamburger menu' do
        around do |test|
          must_select '#hamburger' do
            test.call
          end
        end

        it 'renders links' do
          {
            'Teachers'         => '//test.code.org/teachers',
            'Districts'        => '//test.code.org/districts',
            'Advocacy'         => 'https://advocacy.code.org',
            'Hour of AI'       => '//test.code.org/hour-of-ai',
            'Parents'          => '//test.code.org/parents',
            'Students'         => '//test.code.org/students',
            'About'            => '//test.code.org/about',
            'Donate'           => '//test.code.org/donate',
            'Help and support' => 'https://support.code.org',
            'Report a problem' => 'https://support.code.org/hc/en-us/requests/new',
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end

        it 'renders links within Privacy & Legal submenu' do
          must_select '#legal_entries', 'Privacy & Legal'
          must_select '#legal_entries-items' do
            {
              'Privacy Policy'   => '//test.code.org/privacy',
              'Cookie Notice'    => '//test.code.org/cookies',
              'Terms of Service' => '//test.code.org/terms-of-service'
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end
      end
    end
  end

  context 'when signed in as teacher' do
    let(:teacher) {create(:teacher)}

    before do
      sign_in teacher
    end

    around do |test|
      get '/teacher_dashboard/home'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', '/home'
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'My Dashboard'          => 'https://test-studio.code.org/home',
          'Course Catalog'        => 'https://test-studio.code.org/catalog',
          'Projects'              => 'https://test-studio.code.org/projects',
          'Professional Learning' => 'https://test-studio.code.org/my-professional-learning',
          'Incubator'             => '//test.code.org/incubator'
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project button' do
        must_select '#header_create_menu[role="button"]', /New project/
      end

      it 'renders account links' do
        must_select '#header_user_menu[role="button"]', Regexp.new(teacher.short_name) do
          {
            'My projects'      => 'https://test-studio.code.org/projects',
            'Account settings' => 'https://test-studio.code.org/users/edit',
            'Sign out'         => 'https://test-studio.code.org/users/sign_out'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders hamburger menu' do
        must_select '#hamburger'
      end
    end
  end

  context 'when signed in as student' do
    let(:student) {create(:student)}

    before do
      sign_in student
    end

    around do |test|
      get '/home'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', '/home'
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'My Dashboard'          => 'https://test-studio.code.org/home',
          'Course Catalog'        => '//test.code.org/students',
          'Projects'              => 'https://test-studio.code.org/projects',
          'Incubator'             => '//test.code.org/incubator'
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project button' do
        must_select '#header_create_menu[role="button"]', /New project/
      end

      it 'renders account links' do
        must_select '#header_user_menu[role="button"]', Regexp.new(student.short_name) do
          {
            'My projects'      => 'https://test-studio.code.org/projects',
            'Account settings' => 'https://test-studio.code.org/users/edit',
            'Sign out'         => 'https://test-studio.code.org/users/sign_out'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders hamburger menu' do
        must_select '#hamburger'
      end
    end
  end

  context 'on lab page' do
    let!(:spritelab) do
      spritelab_name = ProjectsController::STANDALONE_PROJECTS[:spritelab][:name]
      Level.find_by_name(spritelab_name) || create(:spritelab, name: spritelab_name)
    end

    around do |test|
      get '/projects/spritelab/fake-channel-id/edit'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders lab specific helper links' do
        must_select '#help-button #help-contents' do
          must_select 'a[href^="https://support.code.org/hc/en-us/requests/new"]', 'Report a problem'

          {
            'Sprite Lab Documentation' => 'https://test-studio.code.org/docs/spritelab',
            'Sprite Lab Tutorials'     => '//test.code.org/educate/spritelab',
            'Help and support'         => 'https://support.code.org',
            'Report abuse'             => 'https://test-studio.code.org/report_abuse'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end
    end
  end
end
