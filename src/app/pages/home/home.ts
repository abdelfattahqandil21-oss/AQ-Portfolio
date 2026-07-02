import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { SkillsSection } from './skills/skills';
import { ProjectsSection } from './projects/projects';

@Component({
  selector: 'page-home',
  imports: [Hero, SkillsSection, ProjectsSection],
  template: `<hero-section /> <skills-section /> <projects-section />`,
})
export class Home {}
