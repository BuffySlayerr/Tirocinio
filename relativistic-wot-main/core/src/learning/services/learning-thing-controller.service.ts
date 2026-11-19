import { Injectable } from '@nestjs/common';
import { ConsumedThing } from '@node-wot/core';
import { NodeWotService } from '../../shared/node-wot/node-wot.service';
import { time } from 'console';

@Injectable()
export class LearningThingControllerService {
  interval = 2500;
  thing: ConsumedThing;
  thingUrl: string;
  // servientThing: ConsumedThing;
  // twinServientThingUrl: string;
  thingTwins: ConsumedThing[] = [];
  thingTwinUrls: string[] = [];
  runInterval;
  sep = ';';
  constructor(private readonly nodeWotService: NodeWotService) {}

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

  async run(payload: any) {
    let readAdditionalHardware = false;
    let csv = '';
    // eslint-disable-next-line prettier/prettier
    const header = ['"operation"', '"timestamp"', '"temperature"', '"temperature1"', '"heater"', '"cooler"', '"additionalHardware"'];
    csv = this.addCSVRow(csv, header, this.sep); // header
    try {
      await this.thing.invokeAction('reset', null); // perform a reset
      await this.thing.invokeAction('setSimParameters', {
        input: { ...payload },
      });
      if (!('instructions' in payload)) {
        return;
      }
      const maxTimestamp = +payload.maxTimestamp;
      const interval = +payload.measurementInterval;
      const instructions = payload.instructions;
      let index = 0;
      for (let t = 0; t <= maxTimestamp; t = t + interval) {
        const temperature = await this.thing.readProperty('temperature', {
          uriVariables: { time: t },
        });
        const temperature1 = await this.thing.readProperty('temperature1', {
          uriVariables: { time: t },
        });
        const heater = await this.thing.readProperty('heater', {
          uriVariables: { time: t },
        });
        const cooler = await this.thing.readProperty('cooler', {
          uriVariables: { time: t },
        });
        let additionalHardwareValue = '';
        const observation_row = ['"observation"', t, temperature, temperature1, `"${heater}"`, cooler, 'n/a'];
        if (readAdditionalHardware) {
          additionalHardwareValue = JSON.stringify(await this.thing.readProperty(
            'additionalHardware',
            {
              uriVariables: { time: t },
            },
          ));
              observation_row[6] = additionalHardwareValue;
              console.log(additionalHardwareValue);
        }

        console.log(temperature, temperature1)
        // eslint-disable-next-line prettier/prettier
        csv = this.addCSVRow(csv, observation_row, this.sep);
        // console.log(t, temperature);
        if (index < instructions.length) {
          let inst = instructions[index];
          let timestamp = +inst[0];
          while (timestamp < t + interval) {
            inst = instructions[index];
            timestamp = +inst[0];
            const heater = inst[1];
            const cooler = inst[2];
            let additionalHardware = '';
            if (inst.length > 3) {
              additionalHardware = inst[3];
            }
            // console.log(timestamp, t + interval)
            // console.log(timestamp, heater, cooler);
            await this.thing.invokeAction('toggleHeater', {
              input: { on: JSON.parse(heater), time: timestamp },
            });
            await this.thing.invokeAction('toggleCooler', {
              input: { on: JSON.parse(cooler), time: timestamp },
            });
            if (additionalHardware !== '') {
              await this.thing.invokeAction('toggleAdditionalHardware', {
                input: {payload: JSON.parse(additionalHardware.replace(/'/g, '"')), time: timestamp},
              });
              readAdditionalHardware = true;
            }
            // eslint-disable-next-line prettier/prettier
            const row = ['"action"', timestamp.toString(), "-1", "-1", `"${heater}"`, cooler, "n/a"];
            if (additionalHardware !== '') {
              row[6] = JSON.stringify(additionalHardware);
            }
            csv = this.addCSVRow(csv, row, this.sep);
            index++;
            if (index < instructions.length) {
              inst = instructions[index];
              timestamp = +inst[0];
            } else {
              break;
            }
          }
        }
      }
      return csv;
    } catch (err) {
      console.log(err);
    }
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

  addCSVRow(source, text: string[], delimiter = ',') {
    // const delimiter = ',';
    return source + text.join(delimiter) + '\n';
  }
}
