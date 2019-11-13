import Sounds from '../Sounds';

let mySounds = null;

export const loadSounds = () => {
  mySounds = new Sounds();

  for (var i = 1; i <= 10; i++) {
    mySounds.register({id: 'voice_' + i, ogg: 'sounds/mysound.ogg', mp3: `/sounds/ai_voice/ai_voice_${i}.mp3`});
  }

  for (var i = 1; i <= 10; i++) {
    mySounds.register({id: 'yes_' + i, ogg: 'sounds/mysound.ogg', mp3: `/sounds/item_select_buttons/yes/yes_${i}.mp3`});
  }

  for (var i = 1; i <= 10; i++) {
    mySounds.register({id: 'no_' + i, ogg: 'sounds/mysound.ogg', mp3: `/sounds/item_select_buttons/no/no_${i}.mp3`});
  }

  for (var i = 1; i <= 4; i++) {
    mySounds.register({id: 'other_' + i, ogg: 'sounds/mysound.ogg', mp3: `/sounds/item_select_buttons/other/button_${i}.mp3`});
  }

  mySounds.register({id: 'ambience', ogg: '', mp3: 'sounds/ambience/underwater_ambience_loopable.mp3'});
}

export const playSound = (name) => {
  mySounds.play(name);
}
