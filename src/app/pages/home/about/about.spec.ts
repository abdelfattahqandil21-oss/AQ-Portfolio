import { render, screen } from '@testing-library/angular';
import { AboutSection } from './about';
import { TranslationService } from '../../../core/services/translation/translation';
import { ScrollService } from '../../../core/services/scroll/scroll';

describe('AboutSection', () => {
  const setup = (active = false) =>
    render(AboutSection, {
      providers: [TranslationService, ScrollService],
      inputs: { active },
    });

  it('renders the name', async () => {
    await setup();
    expect(screen.getByText('Abdelfattah Qandil')).toBeTruthy();
  });

  it('renders the about heading in English', async () => {
    await setup();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('renders tech badges', async () => {
    await setup();
    expect(screen.getByText('Angular')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('Node.js')).toBeTruthy();
    expect(screen.getByText('Tailwind CSS')).toBeTruthy();
  });

  it('renders the canvas element', async () => {
    const { container } = await setup();
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});
