import type { ImageMetadata } from 'astro';
import cppIcon from '../assets/icons/skill-icons/cpp.svg';
import csIcon from '../assets/icons/skill-icons/cs.svg';
import javaIcon from '../assets/icons/skill-icons/java.svg';
import mysqlIcon from '../assets/icons/skill-icons/mysql.svg';
import phpIcon from '../assets/icons/skill-icons/php.svg';
import pythonIcon from '../assets/icons/skill-icons/python.svg';

export interface Language {
  name: string;
  icon: ImageMetadata;
  optional?: boolean;
}

export const languages: Language[] = [
  { name: 'PHP', icon: phpIcon },
  { name: 'MySQL', icon: mysqlIcon },
  { name: 'C++', icon: cppIcon },
  { name: 'Java', icon: javaIcon },
  { name: 'Python', icon: pythonIcon, optional: true },
  { name: 'C#', icon: csIcon },
];