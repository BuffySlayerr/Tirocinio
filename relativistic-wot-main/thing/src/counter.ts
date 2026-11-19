import { ExposedThing } from "@node-wot/core";

export class Counter {
    thing: ExposedThing; 
    value = 0;
    maxValue = 5;
    constructor(thing){
        
        this.thing = thing

        this.thing.setPropertyReadHandler("value", async () => this.value );        
        this.thing.setPropertyWriteHandler('value', async (value) => this.value  = value );        
        // set action handlers
        this.thing.setActionHandler("increment", async (value, options) => {
            this.changeValue(value.input);
            this.thing.emitEvent('actionInvoked', {action: 'increment', value})
            return {value: await this.thing.readProperty('value')};
        });
        
        this.thing.setActionHandler("decrement", async (value, options) => {
            await this.changeValue(value.input * -1)
            this.thing.emitEvent('actionInvoked', {action: 'decrement', value})
            return {value: await this.thing.readProperty('value')};
        });

        this.thing.setActionHandler('time', async (options) => {
            const perc = 0.7;
            const value = Math.random() < perc ? 1 : -1; // 70% increment by 1, 30% decrement by 1 
            this.changeValue(value)
            this.thing.emitEvent('actionInvoked', {action: 'time', value})
            return {value: await this.thing.readProperty('value')};
        });
    }


    async changeValue(newValue) {
        const val = mod((this.value + newValue ), this.maxValue);
        await this.thing.writeProperty('value', val);
        return;
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}