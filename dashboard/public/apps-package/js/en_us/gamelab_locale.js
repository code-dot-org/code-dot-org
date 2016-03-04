var gamelab_locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){gamelab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){gamelab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=gamelab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){gamelab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).gamelab_locale = {
"dropletBlock_width_description":function(d){return "The width of the drawing canvas."},
"dropletBlock_height_description":function(d){return "The height of the drawing canvas."},
"dropletBlock_createSprite_description":function(d){return "Creates a sprite at the initial specified position with the given placeholder dimensions."},
"dropletBlock_createSprite_param0_description":function(d){return "Initial x coordinate."},
"dropletBlock_createSprite_param1_description":function(d){return "Initial y coordinate."},
"dropletBlock_createSprite_param2_description":function(d){return "Width of the placeholder rectangle and of the collider until an image or new collider are set."},
"dropletBlock_createSprite_param3_description":function(d){return "Height of the placeholder rectangle and of the collider until an image or new collider are set."},
"dropletBlock_addToGroup_description":function(d){return "Adds the sprite to the given group."},
"dropletBlock_addToGroup_param0_description":function(d){return "Existing group to add the sprite to."},
"dropletBlock_anim.visible_signatureOverride":function(d){return "[Animation].visible"},
"dropletBlock_attractionPoint_description":function(d){return "Pushes the sprite toward a point. The force is added to the current velocity."},
"dropletBlock_attractionPoint_param0_description":function(d){return "Scalar speed to add."},
"dropletBlock_attractionPoint_param1_description":function(d){return "Direction of x coordinate to push the sprite towards."},
"dropletBlock_attractionPoint_param2_description":function(d){return "Direction of y coordinate to push the sprite towards."},
"dropletBlock_group.remove_signatureOverride":function(d){return "[Group].remove(sprite)"},
"dropletBlock_group.bounce_signatureOverride":function(d){return "[Group].bounce(target)"},
"dropletBlock_group.collide_signatureOverride":function(d){return "[Group].collide(target)"},
"dropletBlock_group.displace_signatureOverride":function(d){return "[Group].displace(target)"},
"dropletBlock_group.overlap_signatureOverride":function(d){return "[Group].overlap(target)"},
"dropletBlock_sprite.animation_signatureOverride":function(d){return "[Sprite].animation"},
"dropletBlock_sprite.animation_description":function(d){return "Returns the current animation."},
"dropletBlock_sprite.height_signatureOverride":function(d){return "[Sprite].height"},
"dropletBlock_sprite.height_description":function(d){return "The height of the sprite."},
"dropletBlock_sprite.position.x_signatureOverride":function(d){return "[Sprite].position.x"},
"dropletBlock_sprite.position.y_signatureOverride":function(d){return "[Sprite].position.y"},
"dropletBlock_sprite.previousPosition.x_signatureOverride":function(d){return "[Sprite].previousPosition.x"},
"dropletBlock_sprite.previousPosition.y_signatureOverride":function(d){return "[Sprite].previousPosition.y"},
"dropletBlock_sprite.velocity.x_signatureOverride":function(d){return "[Sprite].velocity.x"},
"dropletBlock_sprite.velocity.y_signatureOverride":function(d){return "[Sprite].velocity.y"},
"dropletBlock_sprite.width_signatureOverride":function(d){return "[Sprite].width"},
"dropletBlock_sprite.width_description":function(d){return "The width of the sprite."},
"dropletBlock_Group_description":function(d){return "Creates an empty group."},
"dropletBlock_add_description":function(d){return "Adds the given sprite to group."},
"dropletBlock_add_param0_description":function(d){return "The sprite to be added."},
"dropletBlock_remove_description":function(d){return "Removes the given sprite from group."},
"dropletBlock_remove_param0_description":function(d){return "The sprite to be removed."},
"dropletBlock_x_description":function(d){return "X coordinate of vector."},
"dropletBlock_y_description":function(d){return "Y coordinate of vector."}};