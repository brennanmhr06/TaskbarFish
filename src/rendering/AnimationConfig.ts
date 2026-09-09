import { createSpriteClip, frameAt, FishPalette, createFishPalette, SpriteClip } from './AnimationConfigTypes';
import { FishSwimFrames, FishIdleFrames } from './FishSprites';

export const FishSwim = createSpriteClip(2, 0.42, 0.15, FishSwimFrames);
export const FishIdle = createSpriteClip(2, 0.7, 0.08, FishIdleFrames);

export { createSpriteClip, frameAt, FishPalette, createFishPalette, SpriteClip };
