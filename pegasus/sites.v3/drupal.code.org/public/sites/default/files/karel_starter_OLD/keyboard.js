Keyboard = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ENTER: 13,
	SHIFT: 16,
	SPACE: 32,
	BACKSPACE: 8,
	TAB: 9,
	CTRL: 17,
	ALT: 18,
};

// Usage: var code3 = Keyboard.digit(3);
Keyboard.digit = function(dig) {
	dig = dig % 10;		// so the digit is 0-9
	return dig + 48;
}

// Usage: var aCode = Keyboard.letter("a");
// Returns the charCode for the first letter in the string
Keyboard.letter = function(let) {
	if (let.length == 0) {
		return null;
	}
	return let.toUpperCase().charCodeAt(0);
}
