const MEDIA_URL = '';

export interface CharacterDefinition {
  name: string;
  staticAvatar: string;
  smallStaticAvatar: string;
  failureAvatar: string;
  winAvatar: string;
}

export interface CharactersDefinition {
  [key: string]: CharacterDefinition;
}

const characters: CharactersDefinition = {
  Steve: {
    name: 'Steve',
    staticAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Neutral.png',
    smallStaticAvatar:
      MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Neutral.png',
    failureAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Fail.png',
    winAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Win.png',
  },
  Alex: {
    name: 'Alex',
    staticAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
    smallStaticAvatar:
      MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
    failureAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Fail.png',
    winAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Win.png',
  },
};

export enum Character {
  Steve = 'Steve',
  Alex = 'Alex',
}

export const DEFAULT_CHARACTER = Character.Steve;

export default characters;
