import type { APIRoute } from 'astro';
import { education, work } from '../data/experience';
import { projects } from '../data/projects';
import { site } from '../data/site';

export const GET: APIRoute = ({ site: origin }) => {
  const home = origin?.href ?? '/';
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    site.intro,
    '',
    '## Projects',
    '',
    ...projects.map(({ title, year, href, description }) => `- [${title} (${year})](${href}): ${description}`),
    '',
    '## Experience',
    '',
    ...[...work, ...education].map(
      ({ title, organization, period, href }) => `- [${title} at ${organization}](${href}): ${period}`,
    ),
    '',
    '## Contact',
    '',
    `- [Website](${home})`,
    ...Object.values(site.socials).map(({ name, url }) => `- [${name}](${url})`),
    `- Email: ${site.email}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};