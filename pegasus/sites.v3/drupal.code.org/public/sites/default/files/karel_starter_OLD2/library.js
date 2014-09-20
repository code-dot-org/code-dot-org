function includeJS(file){
    document.write('<script type="text/' + 'javascript" src="./' + file + '"></script>');
}
Library = ['graphics.js', 'thing.js', 'color.js', 'rectangle.js', 'polygon.js', 'set.js', 'console.js',
           'circle.js', 'text.js', 'randomizer.js', 'line.js', 
           'webimage.js', 'bouncing_ball.js', 'keyboard.js', 'jumper.js', 'boggle.js', 'grid.js',
			'queue.js', 'stack.js'];


KarelLibrary = ['beeper.js', 'wall.js', 'karel.js', 'karelrobot.js', 'karelworld.js', 'karelrunner.js', 
				'karelerrors.js', 'karelgrader.js'];

UsingKarel = false;

for(var i = 0; i < Library.length; i++){
    includeJS(Library[i]);
}

for(var i = 0; i < KarelLibrary.length; i++){
    includeJS('karel/' + KarelLibrary[i]);
}
