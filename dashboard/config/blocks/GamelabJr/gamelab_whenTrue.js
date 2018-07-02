whenEvents = []

function whenTrue(condition, handler) {
  whenEvents.push({
    condition: condition,
    handler: handler
  });
}