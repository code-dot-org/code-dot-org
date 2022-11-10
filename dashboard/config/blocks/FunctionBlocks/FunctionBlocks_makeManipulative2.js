function makeManipulative2(num, s1costume, behavior) {
   makeNewSpriteAnon(s1costume, {"x": 200, "y": 200});   	addBehaviorSimple(({costume: s1costume}), new Behavior(behavior, []));
}