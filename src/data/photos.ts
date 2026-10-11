import type { ImageMetadata } from 'astro';
import alpineLakePhoto from '../assets/images/photos/alpine-lake.jpg';
import churchSpiresPhoto from '../assets/images/photos/church-spires.jpg';
import sunsetSeaPhoto from '../assets/images/photos/sunset-sea.jpg';
import templeOfHeavenPhoto from '../assets/images/photos/temple-of-heaven.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

export const photos: Photo[] = [
  { src: alpineLakePhoto, alt: 'Mountains reflected in a lake' },
  { src: templeOfHeavenPhoto, alt: 'Traditional Chinese temple' },
  { src: churchSpiresPhoto, alt: 'Spire of a historic church' },
  { src: sunsetSeaPhoto, alt: 'Sunset over the sea' },
];