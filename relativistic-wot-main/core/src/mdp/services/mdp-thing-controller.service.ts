import { Injectable } from '@nestjs/common';
import { ConsumedThing } from '@node-wot/core';
import { NodeWotService } from '../../shared/node-wot/node-wot.service';
import { GraphService } from './graph.service';
import { TwinGraphService } from './twin-graph.service';

@Injectable()
export class MDPThingControllerService {
  interval = 2500;
  thing: ConsumedThing;
  thingUrl: string;
  // servientThing: ConsumedThing;
  // twinServientThingUrl: string;
  thingTwins: ConsumedThing[] = [];
  thingTwinUrls: string[] = [];
  runInterval;
  constructor(
    private readonly nodeWotService: NodeWotService,
    private readonly graphService: GraphService,
    private readonly twinGraphService: TwinGraphService,
  ) {}

  async initialize(url: string) {
    this.thingUrl = url;
    this.thing = await this.nodeWotService.consumeFromURL(this.thingUrl);
    // this.twinServientThingUrl = urlTwinServient;
    // try {
    //   this.servientThing = await new DefaultServient(false, {
    //     http: {
    //       port: 8081,
    //     }
    //   }).start();
    // } catch (err) {
    //   this.servientThing = null;
    // }
    //   this.actionInvoked(res),
    // );
  }

  async run() {
    // const properties = this.thing.properties;
    const actions = this.thing.actions;
    const propertyName = 'value';
    this.runInterval = setInterval(async () => {
      const actionName = 'time'; // FIXME: remove
      // const actionName =
      //   Object.keys(actions)[
      //     Math.floor(Math.random() * Object.keys(actions).length)
      //   ];
      const action = actions[actionName];
      const payload: any = {};
      if (
        'input' in action &&
        'minimum' in action.input &&
        'maximum' in action.input
      ) {
        const min = action.input.minimum;
        const max = action.input.maximum;
        console.log(min, max)
        const values = Array.from({ length: max + 1 }, (_, i) => i + min);
        // const values = Array.from({ length: 2 }, (_, i) => i);
        payload.input =
          values[Math.floor(Math.random() * Object.keys(values).length)];
      } else {
        payload.input = null; // no input for this action
      }
      payload.input = null; // FIXME: remove

      const value = await this.thing.readProperty('value');
      const newValue = await this.thing.invokeAction(actionName, payload);
      console.log(actionName, payload.input);
      this.graphService.updateEdgeWeight(
        this.graphService.makeNodeName(propertyName, value),
        this.graphService.makeNodeName(propertyName, newValue),
        `${actionName}(${payload.input === null ? 'no_input' : payload.input})`,
      );
      try {
        if (this.thingTwins.length > 0) {
          const graph = await this.graphService.graph.serialize();
          for (const twin of this.thingTwins) {
            const res = await twin.writeProperty('graph', graph);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }, this.interval);
  }

  async stopRun() {
    clearInterval(this.runInterval);
  }

  actionInvoked(data) {
    console.log(data);
  }

  async addTwin(twinUrl: string) {
    this.thingTwinUrls.push(twinUrl);
    const thing = await this.nodeWotService.consumeFromURL(twinUrl);
    this.thingTwins.push(thing);
  }

  async getTwinStatus(thingUrl: string) {
    const index = this.thingTwinUrls.indexOf(thingUrl);
    const twin = this.thingTwins[index];
    const value = await twin.readProperty('value');
    return value;
  }

  async invokeFakeAction(payload) {
    const index = this.thingTwinUrls.indexOf(payload.thingUrl);
    const twin = this.thingTwins[index];
    const actionName = payload.action.split('(')[0];
    const input = payload.action.match(/\(([^)]+)\)/)[1];
    console.log(actionName, input);
    const res = await twin.invokeAction(actionName, {
      input: input === 'no_input' ? undefined : input,
    });
    const thingName = twin.title;
    const newGraph = await this.twinGraphService.addNodeEdge(thingName, res);
    console.log(res);
    return newGraph;
  }
}
