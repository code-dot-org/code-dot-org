import type {SoundBoard, PlaybackOptions} from '@/audio';

import type {Skin} from './skin';
import type {StudioData} from './Studio';

class ParamLists {
  private level: StudioData;
  private skin: Skin;
  private soundBoard: SoundBoard;

  constructor(level: StudioData, skin: Skin, soundBoard: SoundBoard) {
    this.level = level;
    this.skin = skin;
    this.soundBoard = soundBoard;
  }

  getPlaySoundValues(withRandom: boolean = false): string[] {
    let names: string[] = [...(withRandom ? ['random'] : [])];

    if (this.skin.sounds) {
      names = names.concat(this.skin.sounds);

      if (withRandom) {
        // Insert a random value for each sound group before the first sound in the group:
        for (const group in this.skin.soundGroups) {
          const insertIndex = names.indexOf(
            group + this.skin.soundGroups[group].minSuffix,
          );
          if (insertIndex !== -1) {
            names.splice(
              insertIndex,
              0,
              this.skin.soundGroups[group].randomValue,
            );
          }
        }
      }
    }

    if (this.level.paramRestrictions?.playSound) {
      const restrictions = this.level.paramRestrictions.playSound;
      names = names.filter(name => !!restrictions[name]);
    }

    return names;
  }

  /**
   * Returns a list of sounds for our droplet playSound block.
   */
  playSoundDropdown(): {
    text: string;
    display: string;
    click: (callback: (sound: string) => void) => void;
  }[] {
    const skinSoundMetadata = this.skin.soundMetadata || [];

    return this.getPlaySoundValues(true).map(sound => {
      const lowercaseSound = sound.toLowerCase().trim();
      const handleChooseClick = (callback: (sound: string) => void) => {
        const playbackOptions: PlaybackOptions = {
          volume: 1.0,
          ...((skinSoundMetadata.find(
            metadata => metadata.name.toLowerCase().trim() === lowercaseSound,
          ) || {}) as PlaybackOptions),
        };

        this.soundBoard.play(lowercaseSound, playbackOptions);
        callback(`"${sound}"`);
      };

      return {
        text: `"${sound}"`,
        display: `"${sound}"`,
        click: handleChooseClick,
      };
    });
  }
}

export default ParamLists;
