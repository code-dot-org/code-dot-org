# Jetpack game TODO

- Platformer
- Player character should have a jetpack which animates when used
- Jetpack has fuel
- Items to gain fuel: full tank and a half of a tank to fill 100% and 50% of total capacity
- When player has no fuel, the player does a weak single tile jump
- Player can climb ladders: there is an animation for that as well
- A ladder actor is a simple ladder sprite that one can 'climb' up or down
- If a ladder 'acts as ground' it stops the player when they land on it but otherwise you fall through it unless you trigger a climb where you would stop falling.
- When the player holds the 'jump' key when they have fuel, they will fly. This applies some acceleration against the direction of gravity while they have the key down which will eventually overcome the gravity and propel them up. There is a terminal velocity for their top speed against gravity.
- Releasing the jump key puts the jetpack acceleration to zero and then gravity will take over.

## Second Phase

- Some ground tiles have conveyor belts which push any player touching them in the appropriate direction
- Some ground tiles have ice covering them which will propel the player in the direction they are facing when they touch them and not allow them to stop or change directions. they can jump though.
- Some ground tiles have sludge on them which slows the player down by adding some resistance
- There are coins to collect
- There are gems to collect. These are the goals. Collecting all of the gems unlocks the door to the next level.

## Third Phase

- Enemies!
- One enemy is a robot on a tank track tred. It goes toward the player but only makes decisions when it encounters a ladder or lands after falling or from reaching the end of the ladder. It generally moves in the direction it is going otherwise. It takes ladders if the player is appropriately above or below the ladder from the y position and makes the decision to go left or right if the player is strictly left or right of the enemy at the point of that decision from just the x perspective.
- One enemy is a bat. It flaps its wings and goes up and then glides smoothly down. It goes strictly toward the player but runs into and slides along walls. When it glides it does not change direction.
- Another enemy is a very simple rocket. The rocket just turns right 90 degrees when it hits an obstacle.
- Another enemy is a silver ball, like a pinball. It just falls due to gravity and rolls in the same left or right direction until it encounters a wall where it will start going the other way.

## Fourth Phase

- Teleporters!
- These are pads on the ground that while you are touching them you can press a key to move to another random pad of the same color that isn't the one you came from. There are three different colors. You are invincible while you are animating the teleportation.
- Enemies always take the teleporters whenever they touch them.

## Fifth Phase

- Switches
- There are pads that are switches. When walked over they will toggle. They are of three different colors. When toggled they either add or remove similarly colored walls that otherwise block the player or enemies.

## Sixth Phase

- Lode Runner style block zapping
- A key you hold down will animate the player 'zapping' in the direction they are also holding.
- Certain blocks are 'zappable' and certain blocks are not (metal, perhaps, is not zappable but brick/soil are)
- For zappable blocks, after a certain amount of time animating, the blocks will fade out and become not solid.
- The blocks will reappear soon after which will trap enemies or take a player life.

## Seventh Phase

- Further enemies!
- A random wanderer that cannot go through walls. It moves in small random directions.
- A small eyeball that can go through walls and directly targets the player.
- A spring that just bounces up and down and isn't affected by gravity. It moves up until it encounters a solid wall where it will then change directions.
- A shuriken-looking enemy that animates as a spin and bounces at an angle when it encounters a solid obstacle where it will mirror its angle to reflect itself off of that obstacle.
