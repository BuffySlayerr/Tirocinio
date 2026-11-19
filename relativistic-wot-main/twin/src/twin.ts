import { ExposedThing } from "@node-wot/core";
// import Graph from '../../core/relativistic-wot/graph-library';

export class Twin {
    thing: ExposedThing; 
    value = 0;
    maxValue = 6;
    graph: any = {};
    constructor(thing){
        
        this.thing = thing


        this.thing.setPropertyReadHandler("value", async () => this.value );        
        this.thing.setPropertyWriteHandler('value', async (value) => this.value  = value );

        this.thing.setPropertyReadHandler("graph", async () => this.graph );        
        this.thing.setPropertyWriteHandler('graph', async (graph) => {
            graph = fixEdgeWeights(graph);
            this.graph  = graph;
        });
        // set action handlers
        this.thing.setActionHandler("increment", async (value, options) => {
            const res = await this.changeValue('increment', value.input);
            this.thing.emitEvent('actionInvoked', {action: 'increment', value})
            // return {value: await this.thing.readProperty('value')};
            return res;
        });
        
        this.thing.setActionHandler("decrement", async (value, options) => {
            const res = await this.changeValue('decrement', value.input * -1)
            this.thing.emitEvent('actionInvoked', {action: 'decrement', value})
            // return {value: await this.thing.readProperty('value')};
            return res;
        });

        this.thing.setActionHandler('time', async (options) => {
            const perc = 0.7;
            const value = Math.random() < perc ? 1 : -1; // 70% increment by 1, 30% decrement by 1 
            const res = await this.changeValue('time', value)
            this.thing.emitEvent('actionInvoked', {action: 'time', value})
            // return {value: await this.thing.readProperty('value')};
            return res;
        });
    }


    async changeValue(actionName, payload) {
        let res = {};
        const currentValue = await this.thing.readProperty('value');
        const links = this.graph.links.filter((el) => {
            return el.source === makeNodeLabel(currentValue) &&
            el.label === makeEdgeLabel(actionName, payload);
        });
        const weights = links.map(el => el.weight);
        const rand = Math.random() * 100;
        console.log(links)
        let acc = 0;
        let index = 0;
        for (const el of weights) {
            acc += el;
            if (rand < acc) {
               console.log(rand, links[index]);
               const newValue = links[index].target.split(':')[1];
               const currentValue = await this.thing.writeProperty('value', +newValue);
               res = { ... links[index], newValue };
               return res; 
            } else {
                index++;
            }
        }
        return res;
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function fixEdgeWeights(data) {
    const edges = data.links;
    const sum = {};
    for (const edge of edges) {
        const key = edge.source + '_' + edge.label;
        if (!(key in sum)) {
            sum[key] = [];
        }
        sum[key].push(edge.weight);
    }
    for (const key in sum) {
        sum[key] = parseFloat((100 / (sum[key].reduce((a, b) => a + b, 0))).toFixed(2));
    }
    for (const link of data.links) {
        const key = link.source + '_' + link.label;
        const weight = link.weight * sum[key];
        // if (link.label.includes('no_input')) // FIXME:
        // console.log(link.weight, sum[key])
        link.weight = weight;
    }
    return data;
}

function makeNodeLabel(value) {
    return 'value:' + value;
}

function makeEdgeLabel(actionName, payload) {
    if (actionName !== 'time') {
        return `${actionName}(${payload})`;
    } else {
        return `${actionName}(no_input)`;
    }
}