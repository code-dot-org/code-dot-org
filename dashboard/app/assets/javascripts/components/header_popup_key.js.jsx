components.HeaderPopupKey = React.createClass({
  render: function() {
    return (
        <div className="key" style={{ clear: 'both' }}>
          <dl>
            <dt><span className="puzzle_outer_level">
              <a className="level_link not_tried"><span className="puzzle-number">1</span></a>
            </span></dt>
            <dd>{dashboard.i18n.progress.not_started}</dd>
          </dl><dl>
          <dt><span className="puzzle_outer_level">
            <a className="level_link attempted"><span className="puzzle-number">1</span></a>
          </span></dt>
          <dd>{dashboard.i18n.progress.in_progress}</dd>
        </dl><dl>
          <dt><span className="puzzle_outer_level">
            <a className="level_link passed"><img src={Frame.assetUrl('white-checkmark.png')} /></a>
          </span></dt>
          <dd>{dashboard.i18n.progress.completed_too_many_blocks}</dd>
        </dl><dl>
          <dt><span className="puzzle_outer_level">
            <a className="level_link perfect"><img src={Frame.assetUrl('white-checkmark.png')} /></a>
          </span></dt>
          <dd>{dashboard.i18n.progress.completed_perfect}</dd>
        </dl><dl>
          <dt><span className="puzzle_outer_level puzzle_outer_assessment">
            <a className="level_link not_tried"><span className="puzzle-number">1</span></a>
          </span></dt>
          <dd>{dashboard.i18n.progress.assessment}</dd>
        </dl>
        </div>
    );
  }
});
