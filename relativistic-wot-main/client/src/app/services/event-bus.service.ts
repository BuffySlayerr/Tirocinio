import { Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  snackBarRequestEvent: Subject<any> = new Subject();
  showSpinnerEvent: Subject<any> = new Subject();
  isRunningEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
  ) { }


}
