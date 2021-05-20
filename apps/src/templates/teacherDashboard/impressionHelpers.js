import firehoseClient from '../../lib/util/firehose';

export function recordImpression(study_group) {
  firehoseClient.putRecord({
    study: 'teacher_dashboard_actions',
    study_group: study_group,
    event: 'load_feature',
    data_json: '{}'
  });
}
