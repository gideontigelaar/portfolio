import type { ImageMetadata } from 'astro';
import bombermanScreenshot from '../assets/images/screenshots/bomberman.png';
import fiscariepScreenshot from '../assets/images/screenshots/fiscariep.png';
import groenwerfDarkScreenshot from '../assets/images/screenshots/groenwerf-dark.png';
import groenwerfLightScreenshot from '../assets/images/screenshots/groenwerf-light.png';
import projectArchitectureScreenshot from '../assets/images/screenshots/project-architecture.png';
import ticTacToeScreenshot from '../assets/images/screenshots/tic-tac-toe.png';
import whispScreenshot from '../assets/images/screenshots/whisp.png';

export interface Project {
  title: string;
  year: number;
  description: string;
  details: string;
  tech: string[];
  href?: string;
  screenshot: ImageMetadata;
  screenshotDark?: ImageMetadata;
}

export const projects: Project[] = [
  {
    title: 'Tic-Tac-Toe',
    year: 2026,
    description: 'A Tic-Tac-Toe game running on a custom game engine, written from scratch in Java using LWJGL.',
    details: 'The engine supports scene management, animations, text rendering, and UI components like buttons and text fields.',
    tech: ['Java', 'LWJGL', 'OpenGL'],
    href: 'https://github.com/gideontigelaar/java-game-engine',
    screenshot: ticTacToeScreenshot,
  },
  {
    title: 'Groenwerf',
    year: 2026,
    description: 'A grass height measurement system for ride-on mowers using a Raspberry Pi Pico 2W. Built as a school project for Groenvoorziening A.J. v/d Werf B.V.',
    details: 'The Pico firmware sends measurements to a Flask API, which stores everything in MySQL then syncs with ArcGIS.',
    tech: ['C++', 'Flask', 'ArcGIS'],
    href: 'https://github.com/gideontigelaar/groenwerf',
    screenshot: groenwerfDarkScreenshot,
    screenshotDark: groenwerfLightScreenshot,
  },
  {
    title: 'Fiscariep',
    year: 2024,
    description: 'A print job management system where customers can upload their files and receive a quote. Built as a school project for Fiscariep.',
    details: 'All incoming print jobs stay together in one overview, so that every order can be quoted and followed up from a single place.',
    tech: ['PHP', 'MySQL', 'SCSS'],
    href: 'https://github.com/gideontigelaar/fiscariep',
    screenshot: fiscariepScreenshot,
  },
  {
    title: 'Whisp',
    year: 2024,
    description: 'A social media platform made for developers to interact with each other. Built with Bootstrap, PHP, and JavaScript to make it as maintainable as possible.',
    details: 'The platform is live at whisp.gideontigelaar.com!',
    tech: ['PHP', 'MySQL', 'Bootstrap'],
    href: 'https://github.com/gideontigelaar/whisp',
    screenshot: whispScreenshot,
  },
  {
    title: 'Bomberman',
    year: 2023,
    description: 'A Bomberman game built with RT2D, an OpenGL framework written by my teacher.',
    details: 'The project uses CMake for building, and the code is documented using Doxygen.',
    tech: ['C++', 'RT2D', 'OpenGL'],
    screenshot: bombermanScreenshot,
  },
  {
    title: 'Project Architecture',
    year: 2022,
    description: 'A game made in Unity that showcases custom 3D models made in Blender.',
    details: 'In the game, you repair an interactive village that was destroyed by a monster.',
    tech: ['C#', 'Unity', 'Blender'],
    screenshot: projectArchitectureScreenshot,
  },
];