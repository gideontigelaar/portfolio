import type { ImageMetadata } from 'astro';
import fiscariepScreenshot from '../assets/images/screenshots/fiscariep.png';
import groenwerfDarkScreenshot from '../assets/images/screenshots/groenwerf-dark.png';
import groenwerfLightScreenshot from '../assets/images/screenshots/groenwerf-light.png';
import whispScreenshot from '../assets/images/screenshots/whisp.png';

export interface Project {
  title: string;
  year: number;
  description: string;
  details: string;
  tech: string[];
  href: string;
  screenshot: ImageMetadata;
  screenshotDark?: ImageMetadata;
}

export const projects: Project[] = [
  {
    title: 'Groenwerf',
    year: 2026,
    description:
      'A grass height measurement system for ride-on mowers using a Raspberry Pi Pico 2W. Built as a school project for Groenvoorziening A.J. v/d Werf B.V.',
    details:
      'The firmware on the Pico sends measurements to a Flask API, which syncs with ArcGIS and stores everything in MySQL for a secure dashboard.',
    tech: ['C++', 'Python', 'Flask', 'MySQL', 'ArcGIS'],
    href: 'https://github.com/gideontigelaar/groenwerf',
    screenshot: groenwerfDarkScreenshot,
    screenshotDark: groenwerfLightScreenshot,
  },
  {
    title: 'Fiscariep',
    year: 2024,
    description:
      'A print job management system where customers can upload their files and receive a quote. Built as a school project for Fiscariep.',
    details:
      'All incoming print jobs come together in one overview, so every order can be quoted and followed up from a single place.',
    tech: ['PHP', 'MySQL', 'JavaScript'],
    href: 'https://github.com/gideontigelaar/fiscariep',
    screenshot: fiscariepScreenshot,
  },
  {
    title: 'Whisp',
    year: 2024,
    description:
      'A social media platform made for developers to interact with each other. Built with Bootstrap, PHP, and JavaScript to make it as maintainable as possible.',
    details: 'The platform is live at whisp.gideontigelaar.com.',
    tech: ['PHP', 'JavaScript', 'Bootstrap'],
    href: 'https://github.com/gideontigelaar/whisp',
    screenshot: whispScreenshot,
  },
];