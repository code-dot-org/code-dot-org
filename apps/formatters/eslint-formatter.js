module.exports = function(results) {
  results = results || [];
  var summary = results.map(result => {
    if (result.messages && result.messages.length) {
      const findReactDangerErrorIndex = result.messages.findIndex(
        message => message.ruleId === 'react/no-danger'
      );
      result.messages[findReactDangerErrorIndex].message =
        'You are trying to use dangerouslySetInnerHTML. Please use SafeMarkdown instead if possible.';
    }
    return result.messages;
  });
  console.log(summary);
};
