import { site } from './site';

export const navText = {
  skip: 'Skip to content',
  home: 'Home',
  dark: 'Dark mode',
  light: 'Light mode',
};

export const uiText = {
  carousel: 'carousel',
  slide: 'slide',
  previous: 'Previous',
  next: 'Next',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  show: 'Show',
  showPage: 'Show page',
  close: 'Close',
  position: (current: number, total: number) => `${current} of ${total}`,
  page: (current: number, total: number) => `Page ${current} of ${total}`,
};

export const heroText = {
  flip: 'Flip profile picture',
};

export const summaryText = {
  languages: 'Languages I use',
  question: 'Question?',
  follow: 'Follow me!',
  followLabel: `Follow me on ${site.socials.instagram.name}`,
  whisp: {
    href: 'https://whisp.gideontigelaar.com/',
    alt: 'Whisp',
  },
  photos: 'Photos',
  openPhoto: (alt: string) => `Open photo: ${alt}`,
};

export const emailText = {
  label: 'Email me',
  copied: 'Copied!',
};

export const aboutText = {
  title: 'About',
  paragraphs: [
    `${site.intro} I'm also actively exploring the world of software development and engineering through personal projects and by connecting with new people.`,
    "My interest in programming started at age 11, when I began creating simple games in Unity. A few years later, I started building my own Discord bot. That's when it clicked! I knew I wanted to turn my passion into a career.",
  ],
  work: 'Work Experience',
  education: 'Education',
  showMore: (count: number) => `Show ${count} more`,
  visit: 'Visit website',
};

export const projectsText = {
  title: 'Projects',
  intro: "Here are some of the projects I've worked on.",
  github: 'View on GitHub',
  tech: 'Tech',
  screenshot: (title: string) => `${title} screenshot`,
};

export const contactText = {
  title: 'Contact',
  intro: 'Feel free to reach out to me on any of the following platforms:',
};

export const footerText = {
  milestones: [
    { clicks: 10, text: 'Warming up', shake: 0 },
    { clicks: 25, text: 'On fire!', shake: 0.17 },
    { clicks: 50, text: 'Unstoppable', shake: 0.28 },
    { clicks: 100, text: 'Legendary', shake: 0.41 },
    { clicks: 250, text: 'Maybe take a break?', shake: 0.55 },
  ],
  streak: (clicks: number, text: string) => `${clicks}× ${text}`,
  future: 'Welcome to the future!',
  year3000: 'Year 3000. Still debugging...',
  reset: 'Time machine reset',
  setYearHelp: 'Pass a number, for example setYear(2099)',
  setYear: (year: number) => `Counter set to ${year}`,
};

export const menuText = {
  label: 'Quick menu',
  profile: `View on ${site.socials.linkedin.name}`,
  open: 'Open',
  interact: 'Interact',
  linkTab: 'Open link in new tab',
  copyLink: 'Copy link',
  imageTab: 'Open image in new tab',
  copyImage: 'Copy image',
  copyText: 'Copy text',
  secret: 'Secret menu',
  siteInfo: {
    title: 'About this site',
    text: 'Built with Astro and Tailwind CSS. No trackers or ads, just a lot of small details.',
    eggs: 'Easter eggs found:',
    github: 'View on GitHub',
    repository: `${site.socials.github.url}/portfolio`,
    close: 'Close',
  },
};

export const toastText = {
  linkCopied: 'Link copied',
  linkFailed: "Couldn't copy link",
  imageCopied: 'Image copied',
  imageFailed: "Couldn't copy image",
  textCopied: 'Text copied',
  textFailed: "Couldn't copy text",
  retroOn: 'Retro mode on',
  retroOff: 'Retro mode off',
  disco: 'Disco mode',
  eggFound: (count: number, total: number) => `Easter egg found (${count}/${total})`,
  allEggs: 'You found them all',
};

export const notFoundText = {
  title: `Page not found - ${site.name}`,
  heading: '404',
  message: "This page doesn't exist or has been moved.",
  home: 'Back to home',
  prompt: 'Hover or focus the box to play',
  instructions: 'Catch the dot. Press Space when the dot is in the center.',
  score: (caught: number, goal: number) => `Caught ${caught} of ${goal}`,
  missed: (caught: number, goal: number) => `Missed! Caught ${caught} of ${goal}`,
  win: 'You win! Now go to home.',
  won: 'Game won',
};

export const consoleText = {
  greeting: 'Hi there',
  hint: 'Looking for a developer? Type hireGideon() and press Enter.',
  role: 'Software engineering student & PHP developer',
  details: [
    { label: 'Stack', value: 'PHP, MySQL, C++, Java, Python, C#' },
    { label: site.socials.github.name, value: site.socials.github.url },
    { label: site.socials.linkedin.name, value: site.socials.linkedin.url },
    { label: 'Email', value: site.email },
  ],
  thanks: 'Thanks for checking!',
};

export const llmsText = {
  projects: 'Projects',
  experience: 'Experience',
  contact: 'Contact',
  website: 'Website',
  email: 'Email',
  role: (title: string, organization: string) => `${title} at ${organization}`,
};