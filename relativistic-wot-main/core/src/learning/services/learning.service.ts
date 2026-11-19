import { Injectable } from '@nestjs/common';
import { ConsumedThing } from '@node-wot/core';
import { NodeWotService } from '../../shared/node-wot/node-wot.service';
import { LearningThingControllerService } from './learning-thing-controller.service';

@Injectable()
export class LearningService {
  endpoint = 'http://relativistic-room';
  defaultPort = 8079;
  thingUrl: string;
  // twinServientUrl: string;
  thing: ConsumedThing;
  constructor(
    private readonly nodeWotService: NodeWotService,
    private readonly learningThingControllerService: LearningThingControllerService,
  ) {
    this.thingUrl =
      // 'http://relativistic.iot-prism-lab.cs.unibo.it:8080/relativisticthing';
      this.makeUrl(this.endpoint, this.defaultPort, 'relativisticroom');
    // this.twinServientUrl = this.makeUrl(
    //   this.nodeWotService.twinEndpoint,
    //   this.nodeWotService.defaultTwinPort,
    // );
    // this.getGraph();
    this.start();
  }

  async start() {
    await this.learningThingControllerService.initialize(
      this.thingUrl,
      // this.twinServientUrl,
    );
  }

  async run(payload: any) {
    try {
      // console.log(payload)
      return await this.learningThingControllerService.run(payload);
    } catch (err) {
      console.log(err);
    }
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

  // async createNewDT() {
  //   const path = '../../twin/dist/bundle.js';
  //   const res = await this.nodeWotService.runScript(path);
  //   await this.thingControllerService.addTwin(res.url);
  //   const currentValue = await this.thingControllerService.getTwinStatus(
  //     res.url,
  //   );
  //   const properties = { value: { values: [currentValue] } };
  //   const thingName = res.name;
  //   const actions = this.nodeWotService.getActionsPossibleValues(
  //     this.thingControllerService.thing,
  //   );
  //   return res;
  //   // return JSON.stringify(await this.graphService.graph.serialize());
  //   // res.graph = this.thingControllerService.getTwinStatus(res.url);
  // }

  // async getThingPropertiesActions() {
  //   const properties = this.nodeWotService.getPropertiesPossibleValues(
  //     this.thingControllerService.thing,
  //   );
  //   const actions = this.nodeWotService.getActionsPossibleValues(
  //     this.thingControllerService.thing,
  //   );
  //   return { properties, actions };
  // }
}
