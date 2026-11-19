import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/websockets/shared.module';

import { MDPController } from './mdp.controller';
import { GraphService } from './services/graph.service';
import { MDPThingControllerService } from './services/mdp-thing-controller.service';
import { MDPService } from './services/mdp.service';
import { TwinGraphService } from './services/twin-graph.service';

@Module({
  imports: [SharedModule],
  controllers: [MDPController],
  providers: [
    MDPService,
    GraphService,
    TwinGraphService,
    MDPThingControllerService,
  ],
})
export class MDPModule {}
