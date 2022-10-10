function setPromptWith2Choices(promptText, variableName, choice1, choice2){
	setPromptWithChoices(promptText, variableName, choice1, choice2, undefined, function(val) {this[variableName] = val;});
}