import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketsService {
  frequency = 5;
  lastTimestamp = Date.now();
  newMessage: Subject<unknown> = new Subject();
  subscription;
  constructor(
    private socket: Socket,
    private readonly eventBusService: EventBusService,
  ) {
    socket.on('disconnect', () => {
      this.eventBusService.isRunningEvent.next(false);
    });

    this.subscription = this.receiveChat('graph').subscribe(graph => {
      if (this.checkUpdate()) {
        return this.newMessage.next(graph);
      } else {
        return this.newMessage.next(null);
      }
    });
  }


  sendChat(message) {
    this.socket.emit('isAlive', message);
  }

  receiveChat(topic) {
    return this.socket.fromEvent(topic);
  }

  getUsers() {
    return this.socket.fromEvent('users');
  }

  updateFrequency(freq) {
    this.frequency = freq;
    this.subscription.unsubscribe();
    this.subscription = this.receiveChat('graph').subscribe(graph => {
      if (this.checkUpdate()) {
        return this.newMessage.next(graph);
      } else {
        return this.newMessage.next(null);
      }
    });
  }

  checkUpdate() {
    if (this.eventBusService.isRunningEvent.value === false) {
      this.eventBusService.isRunningEvent.next(true);
    }
    const timestamp = Date.now();
    if (timestamp - this.lastTimestamp >= this.frequency * 1000) {
      console.log('frequency: ' + this.frequency)
      console.log(timestamp - this.lastTimestamp)
      this.lastTimestamp = timestamp;
      return true;
    }
    return false;
  }

}