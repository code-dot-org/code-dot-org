// UnpluggedLevel user={} level={} stage={} app={}
components.UnpluggedLevel = React.createClass({
  render: function() {
    var P = this.props || {};
    var level = P.level;
    var stage = P.stage || {};

    if (!level)
      return false;

    var video_download;
    if (level.video && level.video.download)
      video_download = <a className="video-download btn pull-right" href={level.video.download}>{dashboard.i18n.video.download}</a>;

    var lesson_plans, pegasus_lessons;
    var is_student = P.user && P.user.student;
    if (!is_student) {
      if (stage.lesson_plan_html_url)
        pegasus_lessons = (
            <div className="lesson-plan">
              <h2>{dashboard.i18n.lesson_plan}</h2>
              <a className="btn pdf-button" href={stage.lesson_plan_html_url} target="_blank">{dashboard.i18n.view_lesson_plan}</a>
              <a className="btn pdf-button" href={stage.lesson_plan_pdf_url} target="_blank">{dashboard.i18n.pdf_download}</a>
            </div>
        );

      if (level.pdfs)
        lesson_plans = $.map(level.pdfs, function(pdf) {
          return <a key={pdf.name} className="btn pull-right pdf-button" href={ Frame.getAbsolutePath(pdf.url) } target="_blank">{ pdf.name }</a>;
        });
      else if (!pegasus_lessons)
        lesson_plans = <a className="btn pull-right pdf-button disabled">{dashboard.i18n.download_coming_soon}</a>;
    }

    var video;
    if (level.video)
      video = (
          <div className="video-container" />
      );
    else
      video = (
          <p className="coming-soon">{dashboard.i18n.video_coming_soon}</p>
      );

    return (
        <div className="unplugged">
          <h2>{level.title}</h2>
          <p>{level.desc}</p>
          <div className="video-section">
            <a className="btn btn-primary next-stage" onClick={this.onNextClick}>{dashboard.i18n.next_stage}</a>
            { video_download }
            { lesson_plans }
            <div className="clear" />
            { video }
          </div>
          <div className="clear" />
          { pegasus_lessons }
        </div>
    );

  },

  componentDidMount: function() {
    var el = $('.video-container');
    if (el.length) {
      // TODO: Is the video ever anything but 800px?  (page_width was coming from server)
      el.html('');
      el.append(createVideoWithFallback(this.props.level.video, 800, 800 / (16 / 9)))
    }
  },

  onNextClick: function() {
    var app = this.props.app;

    // Some of these parameters may not be necessary.
    app.onAttempt({
      app: 'unplug',
      level: this.props.level.level_num,
      pass: true,
      result: true,
      testResult: 100,
      onComplete: app.onContinue // It's already bound to app
    });
  }

});
