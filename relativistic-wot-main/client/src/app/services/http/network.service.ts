import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  endPoint = 'http://localhost:3000';
  constructor(
    private http: HttpClient,
  ) { }

  initializeGraph() {
    // return this.http.get('/assets/graph.json').pipe(map((val: any) => {
    return this.http.get(this.endPoint + '/initialize').pipe(map((val: any) => {
      return val;
    }));
  }

  getGraph() {
    return this.http.get(this.endPoint + '/graph').pipe(map((val: any) => {
      return val;
    }));
  }

  getThingPropertiesActions() {
    return this.http.get(this.endPoint + '/thingPropertiesActions').pipe(map((val: any) => {
      return val;
    }));
  }

  run() {
    return this.http.post(this.endPoint + '/run', {}).pipe(map((val: any) => {
      return val;
    }));
  }

  stopRun() {
    return this.http.post(this.endPoint + '/stopRun', {}).pipe(map((val: any) => {
      return val;
    }));
  }

  newDT() {
    return this.http.post(this.endPoint + '/newDT', {}).pipe(map((val: any) => {
      return val;
    }));
  }

  invokeFakeAction(payload) {
    return this.http.post(this.endPoint + '/fakeAction', payload).pipe(map((val: any) => {
      return val;
    }));
  }

  startLearningSimulation(payload) {
    return this.http.post(this.endPoint + '/simulation', payload, {responseType: 'text'}).pipe(map((val: any) => {
      return val;
    }));
  }

}

