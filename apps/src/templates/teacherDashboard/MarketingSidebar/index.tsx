import {LinkButton} from '@code-dot-org/component-library/button';
import Typography from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

const MarketingSidebar = () => {
  const [marketingCampaigns, setMarketingCampaigns] = useState();

  useEffect(() => {
    if (marketingCampaigns === undefined) {
      fetch('/marketing/v1/teacher-dashboard')
        .then(response => response.json())
        .then(response => {
          setMarketingCampaigns(response);
        });
    }
  });

  const renderCampaigns = () => {
    return marketingCampaigns.map((campaign, index) => {
      return (
        <div
          style={{
            padding: '8px',
            backgroundColor: index % 2 === 1 ? 'lightgrey' : 'white',
          }}
        >
          <Typography visualAppearance={'heading-sm'} semanticTag={'h4'}>
            {campaign.campaign_name}
          </Typography>
          <Typography semanticTag={'p'} visualAppearance={'body-four'}>
            {campaign.short_description}
          </Typography>
          <LinkButton href={campaign.campaign_url} text={'Learn More'} />
        </div>
      );
    });
  };

  return marketingCampaigns ? (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {renderCampaigns()}
    </div>
  ) : (
    <div>Loading</div>
  );
};

export default MarketingSidebar;
