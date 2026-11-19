import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EventBusService } from '@services/event-bus.service';
import { GraphService } from '@services/graph.service';
import { NetworkService } from '@services/http/network.service';
import { WebSocketsService } from '@services/websockets.service';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-visualization-options',
  templateUrl: './visualization-options.component.html',
  styleUrls: ['./visualization-options.component.scss']
})
export class VisualizationOptionsComponent extends BaseComponent implements OnInit {
  @Output() liveReloadEvent: EventEmitter<boolean> = new EventEmitter();
  propertyList;
  actionList;
  actionsSelect = new FormControl();
  propertiesSelect = new FormControl();
  liveReload = false;
  isRunning = false;
  startingProperties = [];
  updateFrequency = 5;
  constructor(
    private readonly graphService: GraphService,
    private readonly networkService: NetworkService,
    private readonly eventBusService: EventBusService,
    private readonly websocketService: WebSocketsService,
  ) {
    super();
    this.propertyList = this.graphService.properties;
    this.startingProperties = this.graphService.properties;
    this.propertiesSelect.setValue(this.startingProperties);
    this.actionList = graphService.actions;
    this.subscriptions.push(
      this.eventBusService.isRunningEvent.subscribe(val => this.isRunning = val),

    );
  }
  
  ngOnInit(): void {
  }
  
  selectChange(what: string) {
    if (what === 'nodes') {
      const values = this.propertiesSelect.value;
      this.graphService.filterNodes(values, true)
    } else {
      const values = this.actionsSelect.value;
      this.graphService.filterEdges(values, true)
    }
  }

  activateLiveReload() {
    this.liveReload = !this.liveReload;
    if (this.liveReload) {
      this.liveReloadEvent.emit(true);
    } else {
      this.liveReloadEvent.emit(false);
    }
  }

  async reinitializeGraph() {
    await this.graphService.initialize(true);
    this.graphService.updateGraphSubject.next(true);
  }

  async run() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      await this.networkService.run().toPromise();
    } else {
      await this.networkService.stopRun().toPromise();
    }
  }

  async reloadGraph() {
    await this.graphService.initialize(false);
    this.graphService.updateGraphSubject.next(true);
  }

  changeUpdateFrequency() {
    this.websocketService.updateFrequency(this.updateFrequency);
  }

}