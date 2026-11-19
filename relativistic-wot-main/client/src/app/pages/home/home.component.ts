import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '@shared/base/base.component';
import { Router } from '@angular/router';
import moment from 'moment';
import { NetworkService } from '@services/http/network.service';
import { WebSocketsService } from '@services/websockets.service';
import { GraphService } from '@services/graph.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit {
  options: any;
  sub: Subscription;
  constructor(
    private router: Router,
    private readonly graphService: GraphService,
    private readonly websocketsService: WebSocketsService,
  ) {
    super();
    this.subscriptions.push(
      this.graphService.updateGraphSubject.subscribe(() => {
        this.updateGraph();
      }),
    )

    this.start();


  }
  async start() {
    const options = await this.graphService.initialize(false);
    this.options = { ...options };
  }

  async updateGraph() {
    const options = this.graphService.options;
    this.options = { ...options };
  }

  liveReload(value: boolean) {
    if (value) {
      this.sub = this.websocketsService.newMessage.subscribe(async (graph) => {
        if (!graph) {
          return;
        }
        this.graphService.fixEdgeWeights(graph);
        await this.graphService.buildGraph(graph, true);
        this.updateGraph();
      });
    } else {
      this.sub.unsubscribe();
    }
  }


}