import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    // Intersection Observer for reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 60);
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = this.elementRef.nativeElement.querySelectorAll('.reveal');
    elements.forEach((el: Element) => observer.observe(el));
  }
}
