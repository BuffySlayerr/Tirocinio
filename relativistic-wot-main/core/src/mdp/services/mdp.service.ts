import { Injectable } from '@nestjs/common';
import { ConsumedThing } from '@node-wot/core';
import { NodeWotService } from '../../shared/node-wot/node-wot.service';
import { GraphService } from './graph.service';
import { MDPThingControllerService } from './mdp-thing-controller.service';
import { TwinGraphService } from './twin-graph.service';

@Injectable()
export class MDPService {
  endpoint = 'http://relativistic-thing';
  defaultPort = 8080;
  thingUrl: string;
  // twinServientUrl: string;
  thing: ConsumedThing;
  constructor(
    private readonly nodeWotService: NodeWotService,
    private readonly graphService: GraphService,
    private readonly twinGraphService: TwinGraphService,
    private readonly thingControllerService: MDPThingControllerService,
  ) {
    this.thingUrl =
      // 'http://relativistic.iot-prism-lab.cs.unibo.it:8080/relativisticthing';
      this.makeUrl(this.endpoint, this.defaultPort, 'relativisticthing');
    // this.twinServientUrl = this.makeUrl(
    //   this.nodeWotService.twinEndpoint,
    //   this.nodeWotService.defaultTwinPort,
    // );
    // this.getGraph();
    this.start();
  }

  async start() {
    try {

      await this.thingControllerService.initialize(
        this.thingUrl,
        // this.twinServientUrl,
      );
      await this.initializeGraph();
    } catch (err) {
      console.log(err);
    }
  }

  async initializeGraph() {
    const res = await this.getThingPropertiesActions();
    return JSON.stringify(
      await this.graphService.initializeGraph(res.properties, res.actions),
    );
  }

  async run(value: boolean) {
    if (value) {
      await this.thingControllerService.run();
    } else {
      await this.thingControllerService.stopRun();
    }
  }

  async getGraph() {
    // console.log(thing.properties);
    // console.log(this.nodeWotService.getPropertiesName(thing));
    // console.log(this.nodeWotService.getActionsPossibleValues(thing));

    return JSON.stringify(await this.graphService.graph.serialize());
  }

  makeUrl(endpoint: string, port?, thingName?) {
    return (
      endpoint +
      ':' +
      (port !== undefined ? port : this.defaultPort) +
      '/' +
      (thingName !== undefined ? thingName : '')
    );
  }

  async createNewDT() {
    const path = '../twin/dist/bundle.js';
    const res = await this.nodeWotService.runScript(path);
    await this.thingControllerService.addTwin(res.url);
    const currentValue = await this.thingControllerService.getTwinStatus(
      res.url,
    );
    const properties = { value: { values: [currentValue] } };
    const thingName = res.name;
    const actions = this.nodeWotService.getActionsPossibleValues(
      this.thingControllerService.thing,
    );
    const initialGraph = this.twinGraphService.initializeGraph(
      thingName,
      properties,
      [],
    );
    res.graph = await this.twinGraphService.graphs[thingName].serialize();
    return res;
    // return JSON.stringify(await this.graphService.graph.serialize());
    // res.graph = this.thingControllerService.getTwinStatus(res.url);
  }

  async getThingPropertiesActions() {
    const properties = this.nodeWotService.getPropertiesPossibleValues(
      this.thingControllerService.thing,
    );
    const actions = this.nodeWotService.getActionsPossibleValues(
      this.thingControllerService.thing,
    );
    return { properties, actions };
  }
}
