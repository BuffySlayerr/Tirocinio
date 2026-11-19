import { Injectable } from '@nestjs/common';
import Graph from '../../../graph-library';
import { Subject } from 'rxjs';

@Injectable()
export class TwinGraphService {
  graphUpdateSubject = new Subject();
  graphs: any = {};

  async initializeGraph(twinName: string, properties: any, actions: any) {
    this.graphs[twinName] = Graph();
    const graph = this.graphs[twinName];
    for (const key in properties) {
      const values = properties[key].values.map(
        (el) => key + ':' + el.toString(),
      );
      for (const val of values) {
        graph.addNode(val);
      }
    }

    const nodes = graph.nodes();
    for (const action in actions) {
      const values = actions[action].values.map((el) => el.toString());
      for (const val of values) {
        const label = `${action}(${val})`;
        for (const node of nodes) {
          for (const node1 of nodes) {
            // this.graph.addEdge(node, node, 1, label); // self link
            // console.log(node, node1, label)
            graph.addEdge(node, node1, 1, label); // link to the others
          }
        }
      }
    }
    return graph.serialize();
  }

  async addNodeEdge(thingName, data) {
    const graph = this.graphs[thingName];
    // count char
    // const occ = data.source.split('_').length - 1;
    const occ = graph.nodes().length;
    const newTarget = data.target + new Array(occ + 1).join('_');
    const newSource = occ > 1 ? data.source + new Array(occ).join('_') : data.source;
    console.log(occ, newSource, newTarget);
    graph.addNode(newTarget);
    graph.addEdge(newSource, newTarget, data.weight, data.label);
    return graph.serialize();
  }

  // updateEdgeWeight(u, v, label) {
  //   const edge = this.graph.findEdgeObj(u, v, label);
  //   if (edge) {
  //     console.log('edge:')
  //     console.log(edge)
  //     const weight = edge.weight + 1;
  //     this.graph.updateEdgeObjWeight(edge, weight);
  //     this.graphUpdateSubject.next(this.graph.serialize());
  //   }
  // }

  // makeNodeName(name, value) {
  //   return name + ':' + value;
  // }
}
