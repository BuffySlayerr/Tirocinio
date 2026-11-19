import {  Injectable } from '@nestjs/common';
import { ConsumedThing, ExposedThing, Servient } from '@node-wot/core';
import { Helpers } from '@node-wot/core';
import { ThingDescription } from './types';
import { TDRepository, ThingAction, ThingProperty } from '@node-wot/td-tools';
// import * as tdTools from '@node-wot/td-tools';
import { promises as fs } from 'fs';
import { HttpClientFactory, HttpServer } from '@node-wot/binding-http';

@Injectable()
export class NodeWotService {
  private servient: Servient;
  private helpers: Helpers;
  twinEndpoint = 'http://localhost';
  defaultTwinPort = 8081;

  private thingFactory: WoT.WoT;
  private exposedTwins = 0;
  public constructor() {
    this.initialize();
  }

  public async initialize(): Promise<void> {
    this.servient = new Servient();
    this.helpers = new Helpers(this.servient);
    this.servient.addClientFactory(new HttpClientFactory());
    this.servient.addServer(new HttpServer({ port: this.defaultTwinPort }));
    this.thingFactory = await this.servient.start();
  }

  public async consumeFromTD(td: ThingDescription): Promise<ConsumedThing> {
    return this.thingFactory.consume(td) as Promise<ConsumedThing>;
  }

  public async fetchServient(url: string) {
    return this.helpers.fetch(url);
  }

  public async fetchTD(url: string): Promise<ThingDescription> {
    return this.helpers.fetch(url) as Promise<ThingDescription>;
  }

  public async consumeFromURL(url: string): Promise<ConsumedThing> {
    const td = await this.helpers.fetch(url);
    return this.thingFactory.consume(td) as Promise<ConsumedThing>;
  }

  public async produceThing(TD: ThingDescription): Promise<ExposedThing> {
    return this.thingFactory.produce(TD) as Promise<ExposedThing>;
  }

  public getPropertiesName(thing: ConsumedThing): string[] {
    return Object.keys(thing.properties);
  }

  public getPropertiesPossibleValues(thing: ConsumedThing): any {
    const res = {};
    for (const key in thing.properties) {
      res[key] = {};
      const property: ThingProperty = thing.properties[key];
      if ('minimum' in property && 'maximum' in property) {
        const min = property.minimum;
        const max = property.maximum;
        res[key].values = Array.from({ length: max + 1 }, (_, i) => i + min);
      } else {
        res[key].values = [];
      }
    }
        // res['value'].values = [0, 1, 2];
        console.log(res)
    return res;
  }

  public getActionsPossibleValues(thing: ConsumedThing): any {
    const res = {};
    var counter = 0;
    for (const key in thing.actions) {
      if (counter !== 1) {
        counter++;
        // continue;
      } else {
      }
      res[key] = {};
      const action: ThingAction = thing.actions[key];
      if (
        'input' in action &&
        'minimum' in action.input &&
        'maximum' in action.input
      ) {
        const min = action.input.minimum;
        const max = action.input.maximum;
        res[key].values = Array.from({ length: max + 1 }, (_, i) => i + min);
        // res[key].values = Array.from({ length: 1 }, (_, i) => i);
      } else {
        res[key].values = ['no_input']; // no input for this action
      }
    }
    return res;
  }

  public async runScript(path) {
    let file = await fs.readFile(path, 'utf-8');
    const thingName = 'RelativisticTwin' + '_' + this.exposedTwins;
    file = `const thingName = '${thingName}'\n` + file;
    let thingUrl = `${this.twinEndpoint}:${this.defaultTwinPort}/${thingName}`;
    thingUrl = thingUrl.toLowerCase();
    try {
      await this.servient.runScript(file);
      this.exposedTwins++;
      return { name: thingName, url: thingUrl };
    } catch (err) {
      return err;
    }
  }
}
