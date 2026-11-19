import { OnInit, OnDestroy, Component } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Base component for each other component in the application
 */

@Component({
  selector: 'app-base',
  template: '<div></div>'
})
export class BaseComponent implements OnInit, OnDestroy {
  /**
   * Subscriptions container
   */
  subscriptions: Subscription[] = [];

  constructor(
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    // Unsubscribes all subscriptions
    if (this.subscriptions != null) {
      const listSize = this.subscriptions.length;
      for (let index = 0; index < listSize; index++) {
        this.subscriptions[index].unsubscribe();
      }
    }
  }
}
