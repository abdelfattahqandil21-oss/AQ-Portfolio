import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { SkillsSection } from './skills/skills';

@Component({
  selector: 'page-home',
  imports: [Hero, SkillsSection],
  template: `<hero-section /> <skills-section />`,
})
export class Home {}
