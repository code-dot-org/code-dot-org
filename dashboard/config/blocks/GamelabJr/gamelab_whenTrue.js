function whenTrue(condition, handler) {
  whenTrue.push({
    condition: condition,
    handler: handler
  });
}