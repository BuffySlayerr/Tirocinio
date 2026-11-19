import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '@shared/base/base.component';
import { Router } from '@angular/router';
import moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { NetworkService } from '@services/http/network.service';
import { dataTool } from 'echarts';
import { EventBusService } from '@services/event-bus.service';
import { Constants } from '@shared/constants';

@Component({
  selector: 'app-learning-thing',
  templateUrl: './learning-thing.component.html',
  styleUrls: ['./learning-thing.component.scss']
})
export class LearningThingComponent extends BaseComponent implements OnInit {
  options: any;
  sub: Subscription;
  simulationForm: FormGroup;
  settingsControl = {
    measurementInterval: new FormControl(200, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    maxTimestamp: new FormControl(86400, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha1: new FormControl(0.001, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha2: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha3: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha4: new FormControl(0.002, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha5: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha6: new FormControl(0.001, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha7: new FormControl(1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha8: new FormControl(0.5, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    alpha9: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    sigmaTemp: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    sigmaTempOut: new FormControl(0.1, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    tempOutDelta: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,10})?$')]),
    file: new FormControl(null, [Validators.required]),
    instructions: new FormControl(null, [Validators.required]),
    getCSV: new FormControl(false, [Validators.required]),
  };
  csvRecords: any[] = [];
  header = false;
  constructor(
    private router: Router,
    // private readonly websocketsService: WebSocketsService,
    private formBuilder: FormBuilder,
    private ngxCsvParser: NgxCsvParser,
    private networkService: NetworkService,
    private eventBusService: EventBusService,
  ) {
    super();
    this.subscriptions.push(
    )
    this.simulationForm = formBuilder.group({
      measurementInterval: this.settingsControl.measurementInterval,
      maxTimestamp: this.settingsControl.maxTimestamp,
      alpha1: this.settingsControl.alpha1,
      alpha2: this.settingsControl.alpha2,
      alpha3: this.settingsControl.alpha3,
      alpha4: this.settingsControl.alpha4,
      alpha5: this.settingsControl.alpha5,
      alpha6: this.settingsControl.alpha6,
      alpha7: this.settingsControl.alpha7,
      alpha8: this.settingsControl.alpha8,
      alpha9: this.settingsControl.alpha9,
      sigmaTemp: this.settingsControl.sigmaTemp,
      sigmaTempOut: this.settingsControl.sigmaTempOut,
      tempOutDelta: this.settingsControl.tempOutDelta,
      file: this.settingsControl.file,
      instructions: this.settingsControl.instructions,
      getCSV: this.settingsControl.getCSV,
    });
  };

  async submit(onlyData: boolean) {
    console.log(this.simulationForm.value)
    this.simulationForm.get('getCSV').setValue(onlyData);
    this.eventBusService.showSpinnerEvent.next(true);
    try {
      let data = await this.networkService.startLearningSimulation(this.simulationForm.value).toPromise();
      this.eventBusService.showSpinnerEvent.next(false);
      if (IsJsonString(data)) {
        data = JSON.parse(data);
        console.log(data);
        this.plotData(data);
          this.eventBusService.snackBarRequestEvent.next({
            message: 'Data was properly collected and plotted',
            style: Constants.SNACKBAR_SUCCESS
          });
      } else {
        this.eventBusService.showSpinnerEvent.next(false);
        if (!onlyData) {
          this.eventBusService.snackBarRequestEvent.next({
            errorCode: 'A problem occured, the CSV file will be downloaded instead',
            style: Constants.SNACKBAR_ERROR
          });
        }
        const filename = 'simulation.csv';
        let dataType = 'text/csv';
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob([data], { type: dataType }));
        downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        // window.open(url);
        downloadLink.parentNode.removeChild(downloadLink);
        // const blob = new Blob([data], { type: 'text/csv' });
        // const url= window.URL.createObjectURL(blob);
        // window.open(url);
      }
    } catch (err) {
      this.eventBusService.showSpinnerEvent.next(false);
      this.eventBusService.snackBarRequestEvent.next({
        errorCode: 'A problem occured',
        style: Constants.SNACKBAR_ERROR
      });
      console.log(err);
    }
  }

  resetForm() {
    this.simulationForm.patchValue({});
  }


  public uploadCSV() {
    const file = this.simulationForm.get('file').value;
    if (file) {
      // Parse the file you want to select for the operation along with the configuration
      this.ngxCsvParser.parse(file, { header: this.header, delimiter: ',' })
        .pipe().subscribe((result: Array<any>) => {
          result = result.map(arr => {
            return arr.map(el => {
              if (!isNaN(parseFloat(el))) {
                return parseFloat(el);
              }
              return el; 
            }); 
          });
          console.log(result)
          this.simulationForm.get('instructions').setValue(result);
        }, (error: NgxCSVParserError) => {
          this.simulationForm.get('instructions').setValue(null);
          console.log('Error', error);
        });
    }
  }

  plotData(data) {
    const showHours = true;
    this.options = {
      type: 'scatter',
      title: {
        text: 'Room temperature'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Measurements', 'Guess', 'Optimized', 'Future meas', 'Future', 'Measurements1', 'Guess1', 'Optimized1', 'Future meas1', 'Future1', 'Heater', 'Cooler']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'value',
        boundaryGap: false,
        name: 'Time t',
        nameLocation: 'middle',
      },
      yAxis: {
        type: 'value',
        name: 'Temperature T',
        nameLocation: 'middle',
      },
      series: []
    };
    // data.odesol_guess.y = data.odesol_guess.y;
    // data.odesol_opt.y = data.odesol_opt.y;
    // data.odesol_future.y = data.odesol_future.y;
    if (showHours) {
      data.data_temperature.x = data.data_temperature.x.map((el) => el / 3600);
      data.data_temperature1.x = data.data_temperature1.x.map((el) => el / 3600);
      data.future_data_temperature.x = data.future_data_temperature.x.map((el) => el / 3600);
      data.future_data_temperature1.x = data.future_data_temperature1.x.map((el) => el / 3600);
      data.odesol_guess.t = data.odesol_guess.t.map((el) => el / 3600);
      data.odesol_guess1.t = data.odesol_guess1.t.map((el) => el / 3600);
      data.odesol_opt.t = data.odesol_opt.t.map((el) => el / 3600);
      data.odesol_opt1.t = data.odesol_opt1.t.map((el) => el / 3600);
      data.odesol_future.t = data.odesol_future.t.map((el) => el / 3600);
      data.odesol_future1.t = data.odesol_future1.t.map((el) => el / 3600);
      data['t_grid'] = data['t_grid'].map((el) => el / 3600);
    }
    console.log(data.odesol_opt.t.map((el, index) => [el, data.odesol_opt.y[index]]))
    this.options.series.push(
      {
        name: 'Measurements',
        type: 'line',
        data: data.data_temperature.x.map((el, index) => [el, data.data_temperature.y[index]])
      },
      {
        name: 'Guess',
        type: 'line',
        data: data.odesol_guess.t.map((el, index) => [el, data.odesol_guess.y[index]])
      },
      {
        name: 'Optimized',
        type: 'line',
        data: (data.odesol_opt.t.map((el, index) => [el, data.odesol_opt.y[index]]))
      },
      {
        name: 'Future meas',
        type: 'line',
        data: data.future_data_temperature.x.map((el, index) => [el, data.future_data_temperature.y[index]])
      },
      {
        name: 'Future',
        type: 'line',
        data: data.odesol_future.t.map((el, index) => [el, data.odesol_future.y[index]]).slice(1)
      },
      {
        name: 'Measurements1',
        type: 'line',
        data: data.data_temperature1.x.map((el, index) => [el, data.data_temperature1.y[index]])
      },
      {
        name: 'Guess1',
        type: 'line',
        data: data.odesol_guess1.t.map((el, index) => [el, data.odesol_guess1.y[index]])
      },
      {
        name: 'Optimized1',
        type: 'line',
        data: (data.odesol_opt1.t.map((el, index) => [el, data.odesol_opt1.y[index]]))
      },
      {
        name: 'Future meas1',
        type: 'line',
        data: data.future_data_temperature1.x.map((el, index) => [el, data.future_data_temperature1.y[index]])
      },
      {
        name: 'Future1',
        type: 'line',
        data: data.odesol_future1.t.map((el, index) => [el, data.odesol_future1.y[index]]).slice(1)
      },
      {
        name: 'Heater',
        type: 'line',
        data: data.heater.map((el, index) => [data['t_grid'][index], el])
      },
      {
        name: 'Cooler',
        type: 'line',
        data: data.cooler.map((el, index) => [data['t_grid'][index], el])
      },
    )
  }
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}