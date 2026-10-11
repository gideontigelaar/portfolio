import type { ImageMetadata } from 'astro';
import aldiNordLogo from '../assets/images/logos/aldi-nord.svg';
import alfaCollegeLogo from '../assets/images/logos/alfa-college.svg';
import dotsimpelLogo from '../assets/images/logos/dotsimpel.svg';
import hanzeLogo from '../assets/images/logos/hanze.svg';

export interface ExperienceEntry {
  title: string;
  organization: string;
  period: string;
  href: string;
  logo: ImageMetadata;
  logoAlt: string;
}

export const work: ExperienceEntry[] = [
  {
    title: 'PHP Web Developer',
    organization: 'Dotsimpel',
    period: '2025 - Now',
    href: 'https://www.dotsimpel.nl/',
    logo: dotsimpelLogo,
    logoAlt: 'Dotsimpel Logo',
  },
  {
    title: 'Assistant Store Manager',
    organization: 'ALDI Nederland',
    period: '2024 - Now',
    href: 'https://www.aldi.nl/',
    logo: aldiNordLogo,
    logoAlt: 'ALDI Nord Logo',
  },
];

export const education: ExperienceEntry[] = [
  {
    title: 'Bachelor, Software Engineering',
    organization: 'Hanze',
    period: '2025 - Now',
    href: 'https://www.hanze.nl/',
    logo: hanzeLogo,
    logoAlt: 'Hanze Logo',
  },
  {
    title: 'MBO 4, Software Development',
    organization: 'Alfa-college',
    period: '2021 - 2025',
    href: 'https://www.alfa-college.nl/',
    logo: alfaCollegeLogo,
    logoAlt: 'Alfa-college Logo',
  },
];