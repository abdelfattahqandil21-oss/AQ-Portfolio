import { render } from '@testing-library/angular';
import { Home } from './home';

describe('Home', () => {
  it('creates the home page component', async () => {
    const { container } = await render(Home);
    expect(container.querySelector('hero-section')).toBeInTheDocument();
  });
});
