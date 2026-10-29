import type { APIRoute } from 'astro';
import { education, work } from '../data/experience';
import { projects } from '../data/projects';
import { site } from '../data/site';
import { llmsText } from '../data/text';

export const GET: APIRoute = ({ site: origin }) => {
  const home = origin?.href ?? '/';
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    site.intro,
    '',
    `## ${llmsText.projects}`,
    '',
    ...projects.map(({ title, year, href, description }) => href ? `- [${title} (${year})](${href}): ${description}` : `- ${title} (${year}): ${description}`),
    '',
    `## ${llmsText.experience}`,
    '',
    ...[...work, ...education].map(
      ({ title, organization, period, href }) => `- [${llmsText.role(title, organization)}](${href}): ${period}`,
    ),
    '',
    `## ${llmsText.contact}`,
    '',
    `- [${llmsText.website}](${home})`,
    ...Object.values(site.socials).map(({ name, url }) => `- [${name}](${url})`),
    `- ${llmsText.email}: ${site.email}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};