import { Module } from '@nestjs/common';

import { MDPModule } from './mdp/mdp.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [MDPModule, LearningModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
