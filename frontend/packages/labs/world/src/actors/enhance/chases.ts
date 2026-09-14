// "Chases somebody" — the row that has to be told who.
//
// Steering is the smallest rule that makes an actor BEHAVE: everything else in
// the library is about what happens to a thing, and this is a thing with an
// intention (`rules/stock/steering`). The trait alone does nothing, though,
// because `actor to chase` starts empty and stays empty until something says —
// so a learner who elects Chases and runs the game watches an enemy stand
// perfectly still, with nothing anywhere to explain it.
//
// SO THE ROW ASKS. Which actor to go after cannot be read off the project, and
// guessing it from where the sparkles were opened is the mistake the camera
// already made and taught (`enhance/cameraFollow`). This is the second user of
// that question, and the first that asks it on an ACTOR's behalf.
//
// THE SHAPE IS SHARED NOW. Flapping and Prowling ask the same question and
// write the same line, so the hat, the repointing and the reading of it all
// live in `enhance/hunts`; what is left here is what makes this row this row.
//
// WHAT IT WRITES:
//
//   actors/<target>.actor    define actor named ⟨…⟩
//                              use trait ⟨Steering#Chases⟩
//
//                            when ⟨this actor⟩ is created:
//                              set ⟨actor to chase⟩ of ⟨this actor⟩
//                                to ⟨first actor of ⟨any ⟨Player⟩⟩⟩
//
// WHEN IT IS CREATED, rather than every frame or once in the world. Every
// frame would be a question asked sixty times a second whose answer changed
// once; once in the world would aim the chasers that were there at the start
// and leave every later one standing, which is exactly what a spawner makes.
// The Eyeball in the jetpack level is wired this way by hand, and this is that
// wiring offered rather than copied (`fixtures/jetpack`).
//
// `first actor of`, because the property holds ONE actor and `any ⟨kind⟩` is a
// list. Handed the list directly the socket takes a value of the wrong shape:
// it still compiles, and the enemy still stands still.
//
// ASKED AGAIN, IT REPOINTS. An actor chases one thing, so "chase this one"
// said twice is a learner changing their mind rather than asking for a second
// hat — the same reading, and the same edit in place, that the camera makes of
// being aimed twice.

import {huntRow} from './hunts';

export const chasesEnhancement = huntRow({
  id: 'chases',
  name: 'Chases somebody',
  description:
    'Sets this actor after another one, steering towards it every frame and stopping when it is close enough. How fast it goes and how near it gets are blocks in its file. In a room with walls to go round, Path is the smarter cousin — this one walks straight at what it is after.',
  brings: ['Chases', 'a line saying who'],
  label: 'Chasing',
  rules: ['Steering'],
  traits: ['Steering#ChasesTrait'],
  property: 'world_set_Steering_ActorToChaseProperty',
});
