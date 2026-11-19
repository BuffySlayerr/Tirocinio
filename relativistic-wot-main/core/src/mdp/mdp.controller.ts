import { Body, Controller, Get, Post } from '@nestjs/common';
import { MDPService } from './services/mdp.service';
import { NodeWotService } from '../shared/node-wot/node-wot.service';
import { MDPThingControllerService } from './services/mdp-thing-controller.service';

@Controller()
export class MDPController {
  constructor(
    private readonly mdpService: MDPService,
    private readonly thingControllerService: MDPThingControllerService,
    private readonly nodeWotService: NodeWotService,
  ) {
    // this.mdpService.start();
  }

  @Get('/initialize')
  async initiliazeGraph() {
    return await this.mdpService.initializeGraph();
  }

  @Get('/graph')
  async getGraph() {
    return await this.mdpService.getGraph();
  }

  @Get('/thingPropertiesActions')
  async getThingPropertiesActions() {
    return await this.mdpService.getThingPropertiesActions();
  }

  @Post('/run')
  async run() {
    return await this.mdpService.run(true);
  }

  @Post('/stopRun')
  async stopRun() {
    return await this.mdpService.run(false);
  }

  @Post('/newDT')
  async createNewDT() {
    return await this.mdpService.createNewDT();
  }

  @Post('/fakeAction')
  async invokeFakeAction(@Body() payload: any) {
    return await this.thingControllerService.invokeFakeAction(payload);
  }
}
