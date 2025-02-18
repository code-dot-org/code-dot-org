const minX = 20;
const maxX = 400 - minX;
const minY = 35;
const maxY = 400 - 40;

/**
 * Given a group of sprites, arrange all sprites of this type in a particular
 * layout. This is likely to change some or all of position/scale for
 * the sprites in the group.
 * Entirely derived from the logic for similar blocks in our dance party repo here (more layouts supported there):
 * https://github.com/code-dot-org/dance-party/blob/6672bdb0cffad1cbfda6e7396155f542b6cdcffe/src/p5.dance.js#L637-L911
 */
export function layoutSpriteGroup(group, layout, p5) {
  const count = group.length;
  if (!count) {
    return;
  }

  // Begin by resizing the entire group.
  group.forEach(sprite => {
    sprite.setScale(0.3);
  });

  if (layout === 'top') {
    createRow(group, 100);
  } else if (layout === 'row') {
    createRow(group, 200);
  } else if (layout === 'bottom') {
    createRow(group, 300);
  } else if (layout === 'border') {
    createBorder(group);
  } else if (layout === 'circle') {
    createCircle(group);
  } else if (layout === 'grid') {
    createGrid(group);
  } else if (layout === 'left') {
    createColumn(group, 100);
  } else if (layout === 'column') {
    createColumn(group, 200);
  } else if (layout === 'right') {
    createColumn(group, 300);
  } else {
    throw new Error('Unexpected layout: ' + layout);
  }

  function createBorder(group) {
    // First fill the four corners.
    // Then split remainder into 4 groups. Distribute group one along the top,
    // group 2 along the right, etc.
    if (count > 0) {
      group[0].x = minX;
      group[0].y = minY;
    }
    if (count > 1) {
      group[1].x = maxX;
      group[1].y = minY;
    }
    if (count > 2) {
      group[2].x = maxX;
      group[2].y = maxY;
    }
    if (count > 3) {
      group[3].x = minX;
      group[3].y = maxY;
    }
    if (count > 4) {
      const topCount = Math.ceil((count - 4 - 0) / 4);
      const rightCount = Math.ceil((count - 4 - 1) / 4);
      const bottomCount = Math.ceil((count - 4 - 2) / 4);
      const leftCount = Math.ceil((count - 4 - 3) / 4);

      for (let i = 0; i < topCount; i++) {
        const sprite = group[4 + i];
        // We want to include the corners in our total count so that the first
        // inner sprite is > 0 and the last inner sprite is < 1 when we lerp.
        sprite.x = p5.lerp(minX, maxX, (i + 1) / (topCount + 1));
        sprite.y = minY;
      }

      for (let i = 0; i < rightCount; i++) {
        const sprite = group[4 + topCount + i];
        sprite.x = maxX;
        sprite.y = p5.lerp(minY, maxY, (i + 1) / (rightCount + 1));
      }

      for (let i = 0; i < bottomCount; i++) {
        const sprite = group[4 + topCount + rightCount + i];
        sprite.x = p5.lerp(minX, maxX, (i + 1) / (bottomCount + 1));
        sprite.y = maxY;
      }

      for (let i = 0; i < leftCount; i++) {
        const sprite = group[4 + topCount + rightCount + bottomCount + i];
        sprite.x = minX;
        sprite.y = p5.lerp(minY, maxY, (i + 1) / (leftCount + 1));
      }
    }
  }

  function createCircle(group) {
    const maxCircleRadius = 165;

    // Adjust radius of circle and size of the sprite according to number of
    // sprites in our group.
    const pct = p5.constrain(count / 10, 0, 1);
    const radius = p5.lerp(50, maxCircleRadius, pct);
    const scale = p5.lerp(0.8, 0.3, pct * pct);
    const startAngle = -Math.PI / 2;
    const deltaAngle = (2 * Math.PI) / count;

    group.forEach((sprite, i) => {
      const angle = deltaAngle * i + startAngle;
      sprite.x = 200 + radius * Math.cos(angle);
      sprite.y = 200 + radius * Math.sin(angle);
      sprite.setScale(scale);
    });
  }

  function createGrid(group) {
    // Create a grid where the width is the square root of the count, rounded up,
    // and the height is the number of rows needed to fill in count cells.
    // For our last row, we might have empty cells in our grid (but the row
    // structure will be the same).
    const numCols = Math.ceil(Math.sqrt(count));
    const numRows = Math.ceil(count / numCols);
    group.forEach((sprite, i) => {
      const row = Math.floor(i / numCols);
      const col = i % numCols;
      // || 0 so that we recover from div 0.
      sprite.x = p5.lerp(minX, maxX, col / (numCols - 1) || 0);
      sprite.y = p5.lerp(minY, maxY, row / (numRows - 1) || 0);
    });
  }
}

/**
 * Sets the x & y positions of a group of sprites in order to arrange them
 * in a horizontal row.
 * @param {array<sprite>} group - The group of sprites to arrange
 * @param {int} yLocation - The yLocation to set for all sprites
 */
function createRow(group, yLocation) {
  let count = group.length;
  for (let i = 0; i < count; i++) {
    const sprite = group[i];
    sprite.x = (i + 1) * (400 / (count + 1));
    sprite.y = yLocation;
  }
}

/**
 * Sets the x & y positions of a group of sprites in order to arrange them
 * in a vertical column.
 * @param {array<sprite>} group - The group of sprites to arrange
 * @param {int} xLocation - The xLocation to set for all sprites
 */
function createColumn(group, xLocation) {
  let count = group.length;
  for (let i = 0; i < count; i++) {
    const sprite = group[i];
    sprite.x = xLocation;
    sprite.y = (i + 1) * (400 / (count + 1));
  }
}
