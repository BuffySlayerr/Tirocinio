import { Component, OnInit } from '@angular/core';
import { MDPTwinService } from '@services/mdp-twin.service';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-twin',
  templateUrl: './mdp-twin.component.html',
  styleUrls: ['./mdp-twin.component.scss']
})
export class MDPTwinComponent extends BaseComponent implements OnInit {
  twinNames: string[] = [];
  options: any = {};
  constructor(private readonly mdpTwinService: MDPTwinService) {
    super();
    this.subscriptions.push(this.mdpTwinService.updateTwinSubject.subscribe(async (data: any) => {
      if (data.what === 'add') {
        console.log('add')
        const thingName = data.name;
        this.options[thingName] = {... await mdpTwinService.initialize(true, data.graph)};
        console.log(this.options)
        if (this.twinNames.indexOf(thingName) < 0) {
          this.twinNames.push(thingName);
        }
      }
    })
    );
  }

  ngOnInit(): void {
  }


  liveReload(value: boolean) {
  }

}
