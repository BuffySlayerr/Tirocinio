import { plot, Plot } from 'nodeplotlib';

import randomNormal from "random-normal";

// import * as randomNormal from './lib/random-normal' 
export class State {
    heater: boolean;
    cooler: number;
    temperature: number;
    temperature1: number;
    timestamp: number;
    heatPower: number;
    heatPower1: number;
    additionalHardware: any;
}

export class Simulator {
    currentState: State;
    alpha1 = 0.001;
    alpha2 = 0.1;
    alpha3 = 0.1;
    alpha4 = 0.002;
    alpha5 = 0.1;
    alpha6 = 0.001;
    alpha7 = 1.0;
    alpha8 = 0.5;
    alpha9 = 0.1;
    meanExternalTemperature = 15;
    tempOutDelta = 0;
    tOutOffset = 3600 * 8;
    deltaTOut = 3600 * 24;
    muTempOut = 0;
    sigmaTempOut = 0.1;
    muTemp = 0;
    sigmaTemp = 0.1;
    interval = 1;

    constructor() {
        this.currentState = {
            timestamp : 0,
            temperature: 15,
            temperature1: 16,
            heater: false,
            cooler: 0,
            heatPower: 0,
            heatPower1: 0,
            additionalHardware: {}
        }
    }

    moveOn(newTimestamp: number) {
        if (newTimestamp < this.currentState.timestamp) {
            throw new Error('you are moving to the past');
        } else if (newTimestamp <= this.currentState.timestamp) {
            return;
        }
        this.currentState = this.computeNewState(this.currentState, newTimestamp)
        //this.currentState.temperature = this.computeTemperature(this.currentState, newTimestamp);
    }
    
    computeNewState(previousState: State, newTimestamp: number) {
        let y0 = [previousState.temperature, previousState.temperature1, previousState.heatPower, previousState.heatPower1];
        let t0 = previousState.timestamp;
        const dt = 1;
        // this.currentState.timestamp = newTimestamp;
        const yf = this.integrator(y0, t0, dt, newTimestamp);
        const newState = {...previousState};
        newState.timestamp = newTimestamp;
        newState.temperature = yf[0]
        newState.temperature1 = yf[1]
        newState.heatPower = yf[2]
        newState.heatPower1 = yf[3]
        return newState
    }

    deriv(y, t) {
        // y = [T, T1, H, H1]
        const dydt = [];
        dydt[0] = this.alpha1 * (this.alpha2 * (this.externalTemperature(t) - y[0]) + y[2] - this.cooling() + this.alpha3 * (y[1] - y[0]));
        dydt[1] = this.alpha4 * (this.alpha5 * (this.externalTemperature(t) - y[1]) + y[3] + this.alpha3 * (y[0] - y[1]));
        dydt[2] = this.alpha6 * (this.alpha7 * this.heating() - y[2]);
        dydt[3] = this.alpha6 * (this.alpha8 * this.heating() - y[3]);
        return dydt;
    }

    step(t, y, dt) {
        const dydt = this.deriv(y, t); // optimize with reference parameters
        const tmpDydt = dydt.map(el => el * dt);
        // return y + dt * dydt;
        return y.map((v, i) => v + tmpDydt[i]);
    }

    integrator(y, t, dt, tnew) {
        let nSteps = Math.ceil( (tnew - t)/dt )
        for (let i = 0; i < (nSteps-1); i++) {
            y = this.step(t, y, dt);
            t += dt;
        }
        dt = tnew - t // last time step
        y = this.step(t, y, dt);
        return y;
    }

    externalTemperature(timestamp: number): number {
        let t = this.meanExternalTemperature;
        t += this.tempOutDelta * Math.sin(2 * Math.PI * (timestamp - this.tOutOffset) / this.deltaTOut); // sin + offset
        const rand = randomNormal({mean: this.muTempOut, dev: this.sigmaTempOut});
        t += rand;
        return t;
    }

    heating() {
        if (this.currentState.heater) {
            return 1;
        } else {
            return 0;
        }
    }

    cooling() {
        let res = this.alpha9 * this.currentState.cooler;
        if ("cooler" in this.currentState.additionalHardware) {
            res += this.alpha9 * this.currentState.additionalHardware.cooler;
        }
        return res;
    }

    toggleHeater(timestamp: number, on: boolean) {
        this.moveOn(timestamp);
        this.currentState.heater = on;
    }

    toggleCooler(timestamp: number, setpoint: number) {
        this.moveOn(timestamp);
        this.currentState.cooler = Math.max(0, Math.min(9, Math.round(setpoint)));
    }

    toggleAdditionalCooler(timestamp: number, setpoint: number) {
        this.moveOn(timestamp);
        this.currentState.additionalHardware.cooler = Math.max(0, Math.min(9, Math.round(setpoint)));
        console.log(this.currentState.additionalHardware)
    }

    getTemperatures(timestamp: number) {
        this.moveOn(timestamp);
        let y = [this.currentState.temperature, this.currentState.temperature1];
        y[0] += randomNormal({mean: this.muTemp, dev: this.sigmaTemp});
        y[1] += randomNormal({mean: this.muTemp, dev: this.sigmaTemp});
        if ("temperature" in this.currentState.additionalHardware) {
            // y.push(this.currentState.temperature + randomNormal({mean: this.muTemp, dev: this.sigmaTemp}));
            this.currentState.additionalHardware.temperature = this.currentState.temperature + randomNormal({mean: this.muTemp, dev: this.sigmaTemp});
        } 
        console.log(y)
        return y;
    }

    setParameters(obj: any) {
        for (const key in obj) {
            switch (key) {
                case 'measurementInterval':
                    this.interval = +this.assignParameter(obj["measurementInterval"]);
                    break;
                case 'alpha1':
                    this.alpha1 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha2':
                    this.alpha2 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha3':
                    this.alpha3 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha4':
                    this.alpha4 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha5':
                    this.alpha5 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha6':
                    this.alpha6 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha7':
                    this.alpha7 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha8':
                    this.alpha8 = +this.assignParameter(obj[key]);
                    break;
                case 'alpha9':
                    this.alpha9 = +this.assignParameter(obj[key]);
                    break;
                case 'sigmaTempOut':
                    this.sigmaTempOut = +this.assignParameter(obj[key]);
                    break;
                case 'sigmaTemp':
                    this.sigmaTemp = +this.assignParameter(obj[key]);
                    break;
                case 'tempOutDelta':
                    this.tempOutDelta = +this.assignParameter(obj[key]);
                    break;
                case 'temperature':
                    this.currentState.temperature = +obj[key];
                    break;
                case 'temperature1':
                    this.currentState.temperature1 = +obj[key];
                    break;
                default:
                    break;
            }
        }
    }

    getParameters() {
        return {
            alpha1: this.alpha1,
            alpha2: this.alpha2,
            alpha3: this.alpha3,
            sigmaTempOut: this.sigmaTempOut,
            sigmaTemp: this.sigmaTemp,
            tempOutDelta: this.tempOutDelta,
        }
    }

    assignParameter(val) {
        if (val < 0) {
            throw new Error('you are trying to assign a negative value');
        } else {
            return val;
        }
    }
}


// const sim = new Simulator();
// // const data: Plot[] = [{x: [1, 3, 4, 5], y: [3, 12, 1, 4], type: 'scatter'}];
// const data: Plot[] = [{ type: 'scatter', x: [], y: [] }, { type: 'scatter', x: [], y: [] }];
// const MAX_TIME = 24 * 60 * 60;
// // const MAX_TIME = 24 * 60;
// const x = [];
// const y = [];
// const y1 = [];
// for (let time = 0; time < MAX_TIME; time = time + 10) {
//     switch (time) {
//         case 100:
//             sim.toggleHeater(time, true);
//             break;
//         case 10000:
//             sim.toggleHeater(time, false);
//             break;
//         case 50000:
//             sim.toggleCooler(time, 20);
//             break;
//         default:
//             break;
//     }
//     const t = sim.getTemperatures(time);
//     // console.log(t);
//     x.push(time);
//     y.push(t[0]);
//     y1.push(t[1]);
//     sim.moveOn(time);
// }
// data[0].x = x;
// data[1].x = x;
// data[0].y = y;
// data[1].y = y1;
// console.log(data[0].y)
// console.log(data[1].y)
// plot(data);

