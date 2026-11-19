import { ExposedThing } from "@node-wot/core";
import { Simulator } from "simulator/dist/simulator";
// import { Simulator } from "simulator";

export class Room {
    thing: ExposedThing; 
    simulator: Simulator;
    temperature: number;
    temperature1: number;
    constructor(thing){
        this.simulator = new Simulator();
        this.thing = thing
        this.thing.setPropertyReadHandler("temperature", async (options) => {
            if (options && typeof options === "object" && "uriVariables" in options) {
                if ('time' in options.uriVariables) {
                    let uriVariables = options.uriVariables;
                    const time = uriVariables["time"];
                    const t = await this.getTemperatures(time);
                    return t[0];
                }
            }
            return -1;
        });
        this.thing.setPropertyReadHandler("temperature1", async (options) => {
            if (options && typeof options === "object" && "uriVariables" in options) {
                if ('time' in options.uriVariables) {
                    let uriVariables = options.uriVariables;
                    const time = uriVariables["time"];
                    const t = await this.getTemperatures(time);
                    return t[1];
                }
            }
            return -1;
        });
        this.thing.setPropertyReadHandler("simParameters", async () => this.simulator.getParameters());
        this.thing.setPropertyReadHandler("time", async () => this.simulator.currentState.timestamp);
        this.thing.setPropertyReadHandler("heater", async () => this.simulator.currentState.heater);
        this.thing.setPropertyReadHandler("cooler", async () => this.simulator.currentState.cooler);
        this.thing.setPropertyReadHandler("additionalHardware", async () => {console.log(this.simulator.currentState); return this.simulator.currentState.additionalHardware});
        // set action handlers
        this.thing.setActionHandler("toggleHeater", async (value, options) => {
            // this.thing.emitEvent('actionInvoked', {action: 'increment', value})
            const on = value.input.on;
            const time = value.input.time;
            this.simulator.toggleHeater(time, on);
            return { value: await this.thing.readProperty('heater') };
        });

        this.thing.setActionHandler("toggleCooler", async (value, options) => {
            const on = value.input.on;
            const time = value.input.time;
            this.simulator.toggleCooler(time, on);
            // this.thing.emitEvent('actionInvoked', {action: 'decrement', value})
            return { value: await this.thing.readProperty('cooler') };
        });

        this.thing.setActionHandler("toggleAdditionalHardware", async (value, options) => {
            const obj = value.input.payload;
            const time = value.input.time;
            //convert obj to json
            for (const key in obj) {
                switch (key) {
                    case 'cooler':
                        this.simulator.toggleAdditionalCooler(time, obj[key]);
                        break;
                    case 'temperature':
                        if (obj[key] === true) {
                            this.simulator.currentState.additionalHardware.temperature = 0;
                        } else if (obj[key] === false && this.simulator.currentState.additionalHardware.temperature) {
                            delete this.simulator.currentState.additionalHardware.temperature;
                        }
                        break;
                    default:
                        break;
                }
            }
            return { value: await this.thing.readProperty('additionalHardware') };
        });



        this.thing.setActionHandler("reset", async (value, options) => {
            this.simulator = new Simulator();
            return { value: 'ok' };
        });

        this.thing.setActionHandler("moveToTime", async (value, options) => {
            const time = value.input;
            console.log(time)
            this.simulator.moveOn(time);
            return { value: 'ok' };
        });

        this.thing.setActionHandler("setSimParameters", async (value, options) => {
            const obj = value.input;
            console.log(obj)
            this.simulator.setParameters(obj);
            // this.simulator = new Simulator();
            return { value: 'ok' };
        });

    }

    async getTemperatures(time) {
        const temperatures = this.simulator.getTemperatures(time);
        await this.thing.writeProperty('temperature', temperatures[0]);
        await this.thing.writeProperty('temperature1', temperatures[1]);
        return temperatures;
    }
}
