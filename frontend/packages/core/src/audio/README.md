# Audio Playback

These are support classes for basic audio playback within the site and for some
labs.

The `SoundBoard` class can manage a set of sounds and their overall playback. Use
this to preload a set of sounds to which you assign a unique id and use that id to
play them.

Each sound is managed by a `Sound` class which can be used ideally in conjunction
with the `SoundBoard` or by itself if you pass it your own Web Audio `AudioContext`
instance. Even without Web Audio, the `Sound` class still supports falling back to
using an `<audio>` element for playback which offers broad browser and device
support.

## SoundBoard

The SoundBoard is a class instance that can register and queue sounds for playback.
This gives a fairly simple way of preloading a set of sounds and controlling their
playback via simple string ids.

The general way you can use the SoundBoard is to either use the `register` method
to add sounds one by one via a `SoundConfig` or to use the more generic method
`registerByFilenamesAndId` which lets you specify a set of filenames or URLs with
clear extensions (see the supported extensions in the `Sound` documentation below)
and a unique `id` for that sound and it will configure a basic sound with that
name.

Giving a set of different file formats helps handle compatibility issues with Web
Audio implementations across browsers and devices, although there is currently wide
support for `mp3` and `ogg` in general these days.

### Usage

The most basic usage means registering each sound with a unique `id` and then using
that `id` in future calls. In this case, we are using the `play` method to play the
registered sound.

```
const sounds = new SoundBoard();
sounds.register({
  id: 'mySound',
  mp3: '/sounds/mySound.mp3',
});
sounds.play('mySound');
```

The `play` method can take a set of `PlaybackOptions` which define attributes for
playback such as `volume` or whether or not the sound continues to play in a loop.

```
const sounds = new SoundBoard();
sounds.register({
  id: 'background',
  mp3: '/sounds/background_music.mp3',
});
sounds.play('background', {
  volume: 0.25,
  loop: true,
});
```

Sounds are managed by their `id`, so only one instance of each sound can be
controlled, though in most cases multiple instances of the sound can be played.
Using `sounds.stop('background')` will stop the looping background. The `stop`
method will also stop any other versions of that sound with that id that is
currently playing.

There are few ways to manage the sound playback overall. If you have a bunch of
sounds playing and perhaps looping, you can pause all sounds you are managing
via this SoundBoard using the `pauseSounds` method. You can then restart them
with `restartPausedSounds`. If you do not want to ever restart them, you can
use the `stopAllAudio` function instead.

## Sound

The Sound class contains basic information about a particular sound. A sound can
be defined via a URL or by byte data. When it is defined by URL, it may be
defined with more than one source for different data formats.

Currently, we support, in order of preference, `mp3`, `ogg`, and `wav` file
formats. At least one of these formats needs to be defined when registering the
sound. It also has fallback code to attempt to use an `<audio>` element to play
the sound if the Web Audio functionality is missing for whatever reason.

If you just want to have a singular instance of a Sound without a SoundBoard,
you may just create an instance of the class with your own Web Audio
AudioContext instance, or, if you do not provide that context, it will play
using the `<audio>` element fallback.

When using Web Audio, the Sound class can handle multiple overlapping playback
of the same sound. However, the `stop` method will stop all such instances.
