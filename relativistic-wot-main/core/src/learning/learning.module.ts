import {  Module } from '@nestjs/common';

import { SharedModule } from '../shared/websockets/shared.module';
import { LearningController } from './learning.controller';
import { LearningService } from './services/learning.service';
import { LearningThingControllerService } from './services/learning-thing-controller.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SharedModule, HttpModule],
  controllers: [LearningController],
  providers: [LearningService, LearningThingControllerService],
})
export class LearningModule {}
