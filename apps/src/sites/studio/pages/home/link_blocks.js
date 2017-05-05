import React from 'react';
import ReactDOM from 'react-dom';
import GradientNavCard from '@cdo/apps/templates/teacherHomepage/GradientNavCard';

$(document).ready(showLinkBlocks);

function showLinkBlocks(linkBlocks) {
  const linkBlocksData = document.querySelector('script[data-linkblocks]');
  const config = JSON.parse(linkBlocksData.dataset.linkblocks);

  ReactDOM.render(
    <div>
      {config.map((item, index) => (
        <GradientNavCard
          key={index}
          title={item.text}
          link={item.link}
          description=""
          image="http://code.org/img.png"
          buttonText="Learn more"
        />
      ))}
    </div>,
    document.getElementById('link-blocks-container')
  );
}
