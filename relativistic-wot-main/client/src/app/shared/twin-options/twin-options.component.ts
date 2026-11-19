import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EventBusService } from '@services/event-bus.service';
import { GraphService } from '@services/graph.service';
import { NetworkService } from '@services/http/network.service';
import { MDPTwinService } from '@services/mdp-twin.service';
import { WebSocketsService } from '@services/websockets.service';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-twin-options',
  templateUrl: './twin-options.component.html',
  styleUrls: ['./twin-options.component.scss']
})
export class TwinOptionsComponent extends BaseComponent implements OnInit {
  @Output() liveReloadEvent: EventEmitter<boolean> = new EventEmitter();
  twinList;
  actionList;
  actionsSelect = new FormControl();
  twinsSelect = new FormControl();
  liveReload = false;
  isRunning = false;
  startingProperties = [];
  updateFrequency = 5;
  constructor(
    private readonly mdpTwinService: MDPTwinService,
    private readonly graphService: GraphService,
    private readonly networkService: NetworkService,
    private readonly eventBusService: EventBusService,
    private readonly websocketService: WebSocketsService,
  ) {
    super();
    this.initialize();
  }

  ngOnInit() {
  }

  async initialize() {
    if (this.graphService.properties.length === 0) {
      await this.graphService.initialize(true);
    }
    // this.propertyList = this.graphService.properties;
    // this.startingProperties = this.graphService.properties;
    // this.propertiesSelect.setValue(this.startingProperties);
    this.actionList = this.graphService.actions;

    this.subscriptions.push(
      this.eventBusService.isRunningEvent.subscribe(val => this.isRunning = val),
    );
  }

  async selectChange(what: string) {
    if (what === 'twins') {
      // const values = this.propertiesSelect.value;
      // this.twinService.filterNodes(values, true)
    } else {
      const values = this.actionsSelect.value;
      if (values.length > 0) {
        this.actionsSelect.setValue([]);
        console.log(values)
        const thingName = this.mdpTwinService.currentThingName;
        const res = await this.mdpTwinService.invokeAction(values[0]);
        this.mdpTwinService.updateTwinSubject.next({
          what: 'add',
          name: thingName,
          graph: res,
        });
      }
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
    await this.mdpTwinService.initialize(true);
    this.mdpTwinService.updateTwinSubject.next(true);
  }

  async run() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      await this.networkService.run().toPromise();
    } else {
      await this.networkService.stopRun().toPromise();
    }
  }

  async createNewDT() {
    const res = await this.mdpTwinService.createNewDT();
    console.log(res)
    this.mdpTwinService.updateTwinSubject.next({
      what: 'add',
      ...res
    });
  }

  changeUpdateFrequency() {
    this.websocketService.updateFrequency(this.updateFrequency);
  }

}