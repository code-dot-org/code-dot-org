# frozen_string_literal: true

class Api::V1::Certificates::CompletionSerializer
  include Rails.application.routes.url_helpers

  def initialize(current_user, course_name)
    @current_user = current_user
    @course_name = course_name.presence || ScriptConstants::HOC_NAME
  end

  def as_json(*)
    {
      certificates: certificates,
      courseKind: course_kind,
      recommendations: recommendations,
    }
  end

  private def curriculum
    @curriculum ||= CurriculumHelper.find_matching_unit_or_unit_group(@course_name)
  end

  private def certificates
    return @certificates if defined?(@certificates)

    @certificates =
      if curriculum.is_a?(UnitGroup)
        unit_group_certificates
      elsif curriculum.nil?
        [{courseName: @course_name, coursePath: script_path(ScriptConstants::HOC_NAME)}]
      elsif Policies::ScriptActivity.can_view_congrats_page?(@current_user, curriculum)
        [{courseName: @course_name, coursePath: script_path(curriculum)}]
      else
        []
      end
  end

  private def unit_group_certificates
    units = curriculum.units_for_user(@current_user)
    if curriculum.single_unit_course?
      return [] unless Policies::ScriptActivity.can_view_congrats_page?(@current_user, units.first)

      return [{courseName: @course_name, coursePath: course_path(curriculum)}]
    end

    completed_units = units.filter {|unit| Policies::ScriptActivity.completed?(@current_user, unit)}
    return [{courseName: @course_name, coursePath: course_path(curriculum)}] if completed_units.length == units.length

    completed_units.map {|unit| {courseName: unit.name, coursePath: script_path(unit)}}
  end

  private def course_kind
    return 'hour_of_code' if course_type == 'hoc'
    return 'other' unless course_type == 'pl'

    k5_pl_course? ? 'professional_learning_k5' : 'professional_learning_6_12'
  end

  private def course_type
    @course_type ||= CertificateImage.course_type(@course_name)
  end

  private def k5_pl_course?
    course_version = curriculum&.get_course_version
    course_version&.course_offering&.pl_for_elementary_school? || false
  end

  private def recommendations
    assignable_course_recommendations + primary_recommendations
  end

  private def primary_recommendations
    case course_kind
    when 'hour_of_code'
      hoc_recommendations
    when 'professional_learning_k5', 'professional_learning_6_12'
      professional_learning_recommendations
    else
      next_course_recommendations
    end
  end

  private def hoc_recommendations
    return student_hoc_recommendations if @current_user&.student?

    educator_hoc_recommendations + educator_professional_learning_recommendations
  end

  private def student_hoc_recommendations
    [
      recommendation(
        path: '/s/express',
        title: 'Express Course',
        description: 'Learn computer science at your own pace! Learn to create computer programs, develop problem-solving skills, and work through fun challenges! Make games and creative projects to share with friends, family, and teachers.',
        image_url: 'https://images.code.org/aaee14231592a91f7ca063867bc7454c-ExpressCourse.png',
        action_label: 'Start Course'
      ),
      recommendation(
        path: '/s/csd3-virtual',
        title: 'Introduction to Game Lab',
        description: 'Move at your own pace in this introduction to our Game Lab environment as you program animations, interactive art, and games.',
        image_url: '/shared/images/courses/logo_intro_to_game_lab.jpg',
        action_label: 'Start Course'
      ),
      recommendation(
        path: '/s/csp3-virtual',
        title: 'Turtle Programming in App Lab',
        description: 'Unlock the ability to make rich, interactive apps with JavaScript in the App Lab!',
        image_url: 'https://images.code.org/0773c123ffe9bda234589984c4eb3634-Turtle%20Programming.png',
        action_label: 'Start Course'
      ),
    ]
  end

  private def educator_hoc_recommendations
    [
      recommendation(
        path: 'https://code.org/csc',
        title: 'CS Connections',
        description: 'This curriculum makes the connections between learning computer science and traditional subjects like math, language arts, science, and social studies. Through CS Connections, any classroom can explore its usual subjects in exciting new ways!',
        image_url: '/shared/images/courses/logo_connections.jpg',
        action_label: 'Explore CS Connections'
      ),
      recommendation(
        path: 'https://code.org/csf',
        title: 'CS Fundamentals',
        description: 'Free set of elementary curricula that introduces students to the foundational concepts of computer science and challenges them to explore how computing and technology can impact the world.',
        image_url: '/shared/images/courses/logo_csf.jpg',
        action_label: 'Explore CS Fundamentals'
      ),
      recommendation(
        path: 'https://code.org/ai/how-ai-works',
        title: 'How AI Works',
        description: 'These lessons supplement the video series. Each lesson is paired with a single video from the series, diving-deeper into the concepts introduced in the videos.',
        image_url: '/blockly/media/ai/ai-curriculum-how-ai-works.png',
        action_label: 'Explore lessons'
      ),
    ]
  end

  private def educator_professional_learning_recommendations
    [
      recommendation(
        path: 'https://code.org/teach',
        title: 'Teach with Code.org',
        description: 'Volunteer to teach the Hour of Code or be a guest speaker in a local classroom. Sign up to hear about opportunities near you.',
        image_url: '/shared/images/teach-page-top.png',
        action_label: 'Teach with Code.org'
      ),
      recommendation(
        path: 'https://code.org/educate/professional-development-online',
        title: 'Self-Paced Professional Learning',
        description: 'Volunteers have translated our tutorials in over 45 languages. Help us continue to expand our tutorials for students around the world!',
        image_url: '/shared/images/banners/self-paced-pl-hero.png',
        action_label: 'Explore Professional Learning'
      ),
    ]
  end

  private def professional_learning_recommendations
    workshop_path =
      if course_kind == 'professional_learning_k5'
        'https://code.org/professional-development-workshops'
      else
        'https://code.org/apply'
      end

    [
      recommendation(
        path: workshop_path,
        title: 'Learn about facilitator-led professional learning workshops',
        description: 'Looking for a more hands-on experience? Our facilitator-led workshops are an excellent opportunity to immerse yourself in the curriculum while connecting and sharing insights with educators like you.',
        image_url: '/shared/images/facilitatorLedPlBanner.png',
        action_label: 'Discover facilitator-led workshops'
      ),
      recommendation(
        path: 'https://code.org/educate/professional-development-online',
        title: 'Explore more self-paced professional learning modules',
        description: 'Keep learning with our robust selection of self-paced professional learning modules. Our self-paced learning works in tandem with our curriculum so you can empower yourself and your students at the pace that’s best for you.',
        image_url: '/shared/images/selfPacedPlBanner.png',
        action_label: 'Explore self-paced learning'
      ),
    ]
  end

  private def assignable_course_recommendations
    return [] unless course_type == 'pl'

    course_offering_id = curriculum&.get_course_version&.course_offering_id
    return [] unless course_offering_id

    CourseOffering.assignable_published_for_students_course_offerings.
      select {|offering| offering.self_paced_pl_course_offering_id == course_offering_id}.
      map do |offering|
        summary = offering.summarize_for_catalog
        recommendation(
          path: summary[:course_version_path] || summary['course_version_path'] || '/catalog',
          title: summary[:display_name] || summary['display_name'],
          description: summary[:description] || summary['description'],
          image_url: summary[:image] || summary['image'],
          action_label: 'View in the curriculum catalog'
        )
      end
  end

  private def next_course_recommendations
    script_name = ScriptConstants.csf_next_course_recommendation(@course_name)
    next_script = Unit.get_from_cache(script_name) if script_name
    return [] unless next_script

    [
      recommendation(
        path: script_path(next_script),
        title: next_script.localized_title,
        description: next_script.localized_description,
        image_url: nil,
        action_label: 'Start course'
      ),
    ]
  end

  private def recommendation(path:, title:, description:, image_url:, action_label:)
    {
      path: path,
      title: title,
      description: description,
      imageUrl: image_url,
      actionLabel: action_label,
    }
  end
end
