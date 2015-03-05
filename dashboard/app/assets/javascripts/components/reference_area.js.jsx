// ReferenceArea level={}
components.ReferenceArea = React.createClass({
  render: function() {
    var P = this.props || {};
    var user = P.user || {};
    var state = P.level || {};
    var level = state.level || {}

    var solutionLink;
    if (level.solutionPath && (user.admin || user.teacher)) {
      solutionLink = (
          <div className="solution_link">
            <a href={level.solutionPath}>{dashboard.i18n.reference_area.teacher}</a>
          </div>
      );
    }

    var relatedVideos = [];
    if (level.relatedVideos) {
      relatedVideos.push(<p key="title" className="help_title">{dashboard.i18n.reference_area.teacher}</p>);
      relatedVideos.push(<p key="subtitle" className="help_subtitle">{dashboard.i18n.reference_area.subtitle}</p>);

      for (var i = 0; i < level.relatedVideos.length; i++) {
        var video = level.relatedVideos[i];

        // React may eventually offer an easier way to add multiple data- attributes...
        relatedVideos.push(
            <a key={video.data.key} href="#" className="video_link" onClick={this.onVideoClick}
                data-download={video.data.download}
                data-key={video.data.key}
                data-name={video.data.name}
                data-src={video.data.src}
            >
              <img className="video_thumbnail" src={ Frame.getAbsolutePath(video.thumbnail_url) } width={39*4.7} />
              <div className="video_name"><span>{video.name}</span></div>
            </a>
        );

        if ((i % 2) == 1)
          relatedVideos.push(<div key={"br" + i} className="clear" />);
      }

      relatedVideos.push(<div key="end" className="clear" />);
    }

    return (
        <div className="reference_area" style={{ display: 'none' }}>
          { solutionLink }
          { relatedVideos }
        </div>
    );
  },

  onVideoClick: function(ev) {
    var el = $(ev.target).closest('.video_link');

    showVideoDialog( $.extend({
      enable_fallback: true,
      autoplay: true
    }, el.data()) );
  }
});
