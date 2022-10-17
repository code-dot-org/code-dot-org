function setPromptWithChoice(promptText, variableName, choice1){
	setPromptWithChoices(promptText, variableName, choice1, undefined, undefined, function(val) {this[variableName] = val;});
}