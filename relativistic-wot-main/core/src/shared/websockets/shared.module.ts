import { Module } from '@nestjs/common';
import { NodeWotService } from '../node-wot/node-wot.service';
import { GraphGateway } from './graph.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [NodeWotService, GraphGateway],
  exports: [NodeWotService, GraphGateway],
})
export class SharedModule {}
