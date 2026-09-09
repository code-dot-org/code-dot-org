import generateImageThroughGateway from './generateImage';
import generateTextThroughGateway from './generateText';
import transcribeThroughGateway from './transcribe';

export {
  generateTextThroughGateway as generateText,
  generateImageThroughGateway as generateImage,
  transcribeThroughGateway as transcribe,
};

export type {
  GatewayGeneratedImage,
  GatewayGenerateImageResult,
} from './generateImage';
