import {getStage} from '@/config/stage';

export function getNewRelicConfig() {
  switch (getStage()) {
    case 'development':
    case 'pr':
    case 'test':
      return {
        info: {
          beacon: 'bam.nr-data.net',
          errorBeacon: 'bam.nr-data.net',
          licenseKey: 'NRBR-4df85c688d548ef6dec',
          applicationID: '594580488',
          sa: 1,
        },
        loader_config: {
          accountID: '1421167',
          trustKey: '501463',
          agentID: '594580488',
          licenseKey: 'NRBR-4df85c688d548ef6dec',
          applicationID: '594580488',
        },
      };
    case 'production':
      return {
        info: {
          beacon: 'bam.nr-data.net',
          errorBeacon: 'bam.nr-data.net',
          licenseKey: 'NRBR-7a875ebf5df3c482069',
          applicationID: '594580492',
          sa: 1,
        },
        loader_config: {
          accountID: '501463',
          trustKey: '501463',
          agentID: '594580492',
          licenseKey: 'NRBR-7a875ebf5df3c482069',
          applicationID: '594580492',
        },
      };
  }
}
