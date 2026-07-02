import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { SkillsSection } from './skills/skills';
import { ProjectsSection } from './projects/projects';
import { ContactSection } from './contact/contact';

@Component({
  selector: 'page-home',
  imports: [Hero, SkillsSection, ProjectsSection, ContactSection],
  template: `<hero-section /> <div class="h-[30vh]"></div> <skills-section /> <div class="h-[30vh]"></div> <projects-section /> <div class="h-[30vh]"></div> <contact-section />`,
})
export class Home {}
