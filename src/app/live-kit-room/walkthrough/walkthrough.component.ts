import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.component.html',
  styleUrls: ['./walkthrough.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class WalkthroughComponent {
  // meeting notes section
  walkthroughData = {
    id: 'walkthroughId',
    steps: [
      {
        content: 'Define the function',
        media: '',
        annotation:
          'The function is given as ( f(x) = (x - 3)^2 + 8 ) for ( -1 < x < 9 ).',
        hint: 'Identify the function type and its domain.',
      },
      {
        content: 'Determine the shape of the function',
        media: '',
        annotation:
          'Since the function is a quadratic with a positive coefficient, it forms a parabola opening upwards.',
        hint: 'Quadratic functions of the form ( a(x - h)^2 + k ) have a minimum at ( (h, k) ).',
      },
      {
        content: 'Find the minimum point',
        media: '',
        annotation:
          'The minimum occurs at ( x = 3 ), where ( f(3) = 8 ), so the vertex is at ( (3, 8) ).',
        hint: 'Set the squared term to zero to find the minimum value.',
      },
      {
        step: 'Evaluate function at domain endpoints',
        media: '',
        annotation:
          'Calculate ( f(-1) = (-1 - 3)^2 + 8 = 24 ) and ( f(9) = (9 - 3)^2 + 8 = 44 ).',
        hint: 'Substituting endpoint values helps determine range limits.',
      },
      {
        step: 'Sketch the graph',
        media: '',
        annotation:
          'Plot the points ( (-1, 24) ), ( (3, 8) ), and ( (9, 44) ) and draw a parabola through them.',
        hint: 'Ensure the parabola is symmetric around ( x = 3 ).',
      },
      {
        content: 'Determine the range',
        media: '',
        annotation:
          'Since the minimum value is 8 and the function increases from there, the range is ( 8 < f(x) < 44 ).',
        hint: 'The range is determined by the lowest and highest function values in the given domain.',
      },
    ],
  };
  visibleSteps = [this.walkthroughData.steps[0]];
  currentIndex = 0;

  showNextStep() {
    if (this.currentIndex < this.walkthroughData.steps.length - 1) {
      this.currentIndex++;
      this.visibleSteps.push(this.walkthroughData.steps[this.currentIndex]);
    }
  }
}
