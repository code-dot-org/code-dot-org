// Send Auto Scaling notifications to production channel.
const slack_url = `https://hooks.slack.com/services/${process.env.SLACK_ENDPOINT}`;
console.log('Loading function');

const https = require('https');
const url = require('url');
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {
  'Content-Type': 'application/json'
};

exports.handler = function(event, context, callback) {
  var req = https.request(slack_req_opts, function(res) {
    if (res.statusCode === 200) {
      callback(null, 'posted to slack');
    } else {
      callback('status code: ' + res.statusCode);
    }
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    callback(e.message);
  });

  var cause = event.detail.Cause;
  var error = event.detail.StatusCode == "Failed";
  if (error) {
    cause = cause + "\n" + event.detail.StatusMessage;
  }
  var instanceId = event.detail.EC2InstanceId;
  var instanceLink = `https://console.aws.amazon.com/ec2/v2/home?&region=us-east-1#Instances:search=${instanceId}`;
  var message = {
    username: 'Auto Scaling'
  };
  var type = event["detail-type"];
  var action;
  if (action = type.match(/EC2 Instance-(launch|terminate) Lifecycle Action/)) {
    message.text = `<${instanceLink}|${instanceId}> - EC2 Instance ${action[1].replace(/^./, x=>x.toUpperCase())}`
  } else if (type.match("EC2 Instance (Launch|Terminate) Successful")) {
    var capacity = cause.match(' the capacity from (\\d+) to (\\d+)');
    var duration = (Date.parse(event.detail.EndTime) - Date.parse(event.detail.StartTime)) / 1000;
    message.attachments = [{
      author_name: `${instanceId} - ${type}`,
      author_link: instanceLink,
      fallback: `${instanceId} - ${type}`,
      color: "good",
      mrkdwn_in: ["fields"],
      fields: [
        {title: "Capacity", value: capacity ? `*${capacity[1]}* to *${capacity[2]}*` : '', short: true},
        {title: "Duration", value: `*${~~(duration / 60)}* min *${~~(duration % 60)}* sec`, short: true}
      ]
    }];
  } else {
    message.attachments = [{
      fallback: cause,
      pretext: instanceId + " - " + type,
      color: error ? "danger" : "good",
      fields: [{
        "value": cause,
        "short": false
      }]
    }];
  }

  req.write(JSON.stringify(message));
  req.end();
};
