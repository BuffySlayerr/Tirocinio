import { Injectable } from '@nestjs/common';
import Graph from '../../../graph-library';
import { Subject } from 'rxjs';

@Injectable()
export class GraphService {
  graphUpdateSubject = new Subject();
  graph = Graph();
  async initializeGraph(properties: any, actions: any) {
    this.graph = Graph();
    for (const key in properties) {
      const values = properties[key].values.map(
        (el) => key + ':' + el.toString(),
      );
      for (const val of values) {
        this.graph.addNode(val);
      }
    }

    const nodes = this.graph.nodes();
    for (const action in actions) {
      const values = actions[action].values.map((el) => el.toString());
      for (const val of values) {
        const label = `${action}(${val})`;
        for (const node of nodes) {
          for (const node1 of nodes) {
            // this.graph.addEdge(node, node, 1, label); // self link
            // console.log(node, node1, label)
            this.graph.addEdge(node, node1, 1, label); // link to the others
          }
        }
      }
    }
    return this.graph.serialize();
  }

  updateEdgeWeight(u, v, label) {
    const edge = this.graph.findEdgeObj(u, v, label);
    if (edge) {
      console.log('edge:')
      console.log(edge)
      const weight = edge.weight + 1;
      this.graph.updateEdgeObjWeight(edge, weight);
      this.graphUpdateSubject.next(this.graph.serialize());
    }
  }

  makeNodeName(name, value) {
    return name + ':' + value;
  }
}
