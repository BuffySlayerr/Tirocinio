import { Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { NetworkService } from './http/network.service';

@Injectable({
  providedIn: 'root'
})
export class MDPTwinService {
  updateTwinSubject: Subject<any> = new Subject();
  options: any;
  properties = [];
  actions = [];
  originalNodes = [];
  originalEdges = [];
  edgesFilter: string[] = null;
  nodesFilter: string[] = null;
  currentThingUrl: string = '';
  currentThingName: string = '';
  constructor(
    private readonly networkService: NetworkService,
  ) { }
  async initialize(reset: boolean, data?) {
    if (!data) {
      if (reset) {
        // data = await this.initializeTwinGraph();
      } else {
        data = await this.getGraph();
      }
    }
    // this.fixEdgeWeights(data);
    console.log(data)
    this.options = {
      title: {
        text: 'Graph'
      },
      tooltip: {},
      series: [
        {
          type: 'graph',
          autoCurveness: true,
          // layout: 'force',
          // force: {initLayout: 'circular', edgeLength: 250},
          // layout: 'circular',
          layout: 'none',
          symbolSize: 100,
          roam: true,
          label: {
            normal: {
              show: true
            }
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            textStyle: {
              color: 'red',
              fontSize: 10
            },
            emphasis: {
              textStyle: {
                color: '#987654'
              }
            }
          },
        }
      ]
    }
    return this.buildGraph(data, false);
  }

  async initializeGraph() {
    return this.networkService.initializeGraph().toPromise();
  }

  async getGraph() {
    return this.networkService.getGraph().toPromise();
  }

  fixEdgeWeights(data) {
    console.log(data)
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
      sum[key] = parseFloat((100/(sum[key].reduce((a, b) => a + b, 0))).toFixed(2));
    }
    for (const link of data.links) {
      const key = link.source + '_' + link.label;
      const weight = link.weight * sum[key];
      // if (link.label.includes('no_input')) // FIXME:
      // console.log(link.weight, sum[key])
      link.weight = weight;
    }
  }

  buildGraph(data, update) {
    const nodes = data.nodes.map((el, index) => {
      if (this.properties.indexOf(el.id) < 0) {
        this.properties.push(el.id);
      }
      return {
        name: el.id,
        x: this.getNodeCoordinates(index, data.nodes.length)[0],
        y: this.getNodeCoordinates(index, data.nodes.length)[1],
        category: index,
      }
    });
    // const categories = Array.from({ length: nodes.length + 1 }, (_, i) => i + 0);
    let categories = data.nodes.map((node) => { return {name: node.id}});
    // for (const node of data.nodes) {
    //   categories.push({
    //     name: node.name,
    //   });
    // }

    const links = [];
    for (const link of data.links) {
      if (this.actions.indexOf(link.label) < 0) {
        this.actions.push(link.label);
      }
      if (link.weight < 10) {
        continue;
      }
      links.push({
        id: link.label,
        source: link.source,
        target: link.target,
        value: link.weight,
        lineStyle: {
          color: 'green',
          width: +this.getEdgeWidth(link.weight), // I decide to put 5 as the maximum value
        },
        label: {
          normal: {
            fontWeight: this.getFontWeight(link.weight),
            formatter: () => { return `${link.label} - ${link.weight.toFixed(2)}%` },
            show: true
          }
        },
      });
    }
    // console.log(data.links)
    if (!update) {
      this.options.series[0].data = [...nodes];
      // this.options.series[0].categories = categories;
      // this.options.legend = [
      //   {
      //     // selectedMode: 'single',
      //     data: categories.map(a => a.name),
      //   }
      // ];
    }
    this.originalNodes = nodes; // update, useless?
    this.originalEdges = links; // update
    this.options.series[0].edges = [...links];
    this.options = { ...this.options }
    if (this.nodesFilter) {
      this.filterNodes(this.nodesFilter, false);
    }
    if (this.edgesFilter) {
      this.filterEdges(this.edgesFilter, false);
    }
    return this.options;
  }

  getFontWeight(weight) {
    if (weight < 30) {
      return 'lighter';
    } else if (weight < 50) {
      return 'normal';
    } else if (weight < 80) {
      return 'bold'
    } else {
      return 'bolder';
    }
  }

  getEdgeWidth(weight) {
    const max = 5;
    if (weight < 30) {
      return max / 8;
    } else if (weight < 50) {
      return max / 4;
    } else if (weight < 80) {
      return max / 2;
    } else {
      return max;
    }
  }

  getNodeCoordinates(index: number, maxIndex: number) {
    let x, y;
    const dX = 100;
    const dY = 50;
    switch (index) {
      case 0:
        x = 0;
        y = 0;
        break;
      default:
        x = dX*index;
        y = 0;
        break;
    }
    return [x, y];
  }

  filterNodes(propertyNames: string[], update) {
    this.nodesFilter = propertyNames;
    if (propertyNames.length > 0) {
      this.options.series[0].data = this.originalNodes.filter(el => propertyNames.indexOf(el.name) > -1);
    } else {
      this.options.series[0].data = this.originalNodes;
    }
    this.options = { ...this.options };
    if (update) {
      this.updateTwinSubject.next(true);
    }
  }

  filterEdges(actionNames: string[], update) {
    this.edgesFilter = actionNames;
    if (actionNames.length > 0) {
      this.options.series[0].edges = this.originalEdges.filter(el => actionNames.indexOf(el.id) > -1);
    } else {
      this.options.series[0].edges = this.originalEdges;
    }
    this.options = { ...this.options };
    if (update) {
      this.updateTwinSubject.next(true);
    }
  }

  async createNewDT() {
    const res = await this.networkService.newDT().toPromise();
    this.currentThingName = res.name;
    this.currentThingUrl = res.url;
    return res;
  }

  async invokeAction(action: string) {
    const payload = {
      thingUrl: this.currentThingUrl,
      action,
    }
    return await this.networkService.invokeFakeAction(payload).toPromise();
  }
}
