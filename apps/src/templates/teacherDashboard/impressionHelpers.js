import harness from '../../lib/util/harness';

export function recordImpression(study_group) {
  harness.trackAnalytics({
    study: 'teacher_dashboard_actions',
    study_group: study_group,
    event: 'load_feature',
    data_json: '{}',
  });
}
