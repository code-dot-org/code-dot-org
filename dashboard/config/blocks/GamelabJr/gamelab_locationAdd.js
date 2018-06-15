function locationAdd(loc1, loc2, operator) {
	loc1 = loc1 || {x: 0, y: 0};
    loc2 = loc2 || {x: 0, y: 0};
    if (operator === 'minus') {
      loc2 = {x: -loc2.x, y: -loc2.y};
    }
	return {x: loc1.x + loc2.x, y: loc1.y + loc2.y};
}