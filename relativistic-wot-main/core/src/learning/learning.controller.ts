import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { LearningService } from './services/learning.service';
import { NodeWotService } from '../shared/node-wot/node-wot.service';
import { LearningThingControllerService } from './services/learning-thing-controller.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class LearningController {
  constructor(
    private readonly learningService: LearningService,
    private readonly thingControllerService: LearningThingControllerService,
    private readonly nodeWotService: NodeWotService,
    private httpService: HttpService,
  ) {
    // this.appService.start();
  }

  @Get('/')
  async initiliazeGraph() {
    return;
  }

  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=simulation.csv')
  @Post('/simulation')
  async run(@Body() payload: any, @Res() res) {
    try {
      const string = await this.learningService.run(payload);
      if (payload.getCSV !== true) {
        try {
          const data = await firstValueFrom(
            this.httpService.post(
              'http://optimizer:5000/',
              { csv: string },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            ),
          );
          res.send(data.data);
        } catch (err) {
          // console.log(err);
          res.attachment = 'simulation.csv';
          return res.send(string);
        }
      } else {
        res.attachment = 'simulation.csv';
        return res.send(string);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
