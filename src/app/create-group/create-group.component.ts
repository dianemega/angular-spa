import { Component, OnInit, Inject } from '@angular/core';
import { Group } from '../model/Group';
import { LoggedInCallback } from '../services/cognito.service';
import { LambdaInvocationService } from '../services/lambdaInvocation.service';
import { AWSError } from 'aws-sdk/global';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { S3Service } from '../services/s3.service';
import { AppConf } from '../shared/conf/app.conf';
import { WindowWrapper } from './../shared/window.mock';

// i don't understand why this has to be outside the class.
let members;

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit, LoggedInCallback {
  FILES = {
    membersFile: 'membersFile',
    groupAvatarFile: 'groupAvatarFile'
  };

  groupsData = new Array<Group>();
  groupControl = new FormControl();
  conf = AppConf;

  types = [];
  subTypes = [];
  createdGroup: Group;
  i: number = 0;
  isOther: boolean = false;
  noSubTypes = [];
  membersError: string = '';
  namesError: string = '';
  zipcodeError: string = '';
  groupsLeaderError: string = '';
  groupTypeError: string = '';
  groupAvatarFile: File;
  membersFile: File;
  // members: string;
  isFileReader: boolean;
  isGroupMembersDisable: boolean = false;

  constructor(public lambdaService: LambdaInvocationService,
    public router: Router,
    private s3: S3Service,
    @Inject(WindowWrapper) private _window: WindowWrapper) { }

  ngOnInit() {
    this.createdGroup = new Group();
    this.lambdaService.listGroupsMetaData(this);

    if ((<any>this._window).FileReader) {
      this.isFileReader = true;
    } else {
      this.isFileReader = false;
    }
  }

  toggleOption(type: string, subtype: string) {
    this.createdGroup.type = type;
    this.createdGroup.groupSubType = subtype;
    if (type === 'Other') {
      this.isOther = true;
      this.createdGroup.type = null;
    } else {
      this.isOther = false;
    }
  }

  creategroup() {
    // trim any spaces in between
    if (this.checkInputs()) {
      // TODO: wouldn't this cause an issue if they input 2 names?
      this.createdGroup.groupMembers = this.extractMembers(this.createdGroup.groupMembers);
      this.s3.uploadFile(this.groupAvatarFile, this.conf.imgFolders.groups, (err, location) => {
        if (err) {
          // we will allow for the creation of the item, we have a default image
          console.log(err);
          this.createdGroup.groupAvatar = this.conf.default.groupAvatar;
        }
        this.createdGroup.groupAvatar = location;

        // EXPECTS an array
        this.lambdaService.createGroup(this.createdGroup, this, 'create');
        // TODO: can we do this without a window reload?
        //  window.location.reload();
        this.router.navigate(['/home']);
      });
    }
  }

  checkInputs() {
    if (!this.createdGroup.groupMembers && !members) {
      this.membersError = 'You must enter at least one group member. Consider adding yourself';
    } else {
      this.membersError = '';
    }
    if (!this.createdGroup.name) {
      this.namesError = 'Group name is required';
    } else {
      this.namesError = '';
    }
    if (!this.createdGroup.zipcode) {
      this.zipcodeError = 'Zipcode is required';
    } else {
      this.zipcodeError = '';
    }
    if (!this.createdGroup.type) {
      this.groupTypeError = 'Group Type is required';
    } else {
      this.groupTypeError = '';
    }
    if (!this.createdGroup.groupLeader) {
      this.groupsLeaderError = 'Group Leader username is required';
    } else {
      this.groupsLeaderError = '';
      return true;
    }
  }

  isLoggedIn(message: string, loggedIn: boolean): void { }

  // result of lambda listActions and Delete Actions API
  callbackWithParams(error: AWSError, result: any): void {
    if (result) {
      const response = JSON.parse(result);
      this.groupsData = response.body;
      this.types = this.groupsData;
      // console.log('groupsData ' + JSON.stringify(this.groupsData));
      // iterate between both arrays to pull out the subTypes which have 'N/A' specified
      for (let i = 0; i < this.groupsData.length; i++) {
        for (let j = 0; j < this.groupsData[i].subType.length; j++) {
          if (this.groupsData[i].subType[j]['subType'] === 'N/A') {
            // add a noSubTypes array so we can display them as top level options
            this.noSubTypes.push(this.groupsData[i].type);
            // splice pulls the subType out of the array that we set back to this.groupsData
            this.types.splice(i, 1);
          }
        }
      }
      this.noSubTypes.push('Other');
      // the final array to display
      this.groupsData = this.types;
    } else {
      console.log('error ' + JSON.stringify(error));
    }
  }

  callbackWithParam(result: any): void { }

  fileEvent(fileInput: any, fileName: string) {
    this[fileName] = fileInput.target.files[0];
    if (this[fileName] && fileName === this.FILES.membersFile) {
      this.getAsText(fileInput.target.files[0]);
      this.isGroupMembersDisable = true;
    } else if (!this[fileName] && this.isGroupMembersDisable) {
      this.isGroupMembersDisable = false;
    }
  }

  getAsText(file: any) {
    const reader = new FileReader();
    // Read file into memory as UTF-8
    reader.readAsText(file);
    // Handle errors load
    reader.onload = this.loadHandler;
    reader.onerror = this.errorHandler;
  }

  loadHandler(event) {
    members = event.target.result;
  }

  errorHandler(evt) {
    if (evt.target.error.name === 'NotReadableError') {
      alert('Cannot read file !');
    }
  }

  extractMembers(input) {
    if (members) {
      return members;
    } else {
      // replace mutiple spaces, then mutiple add commas, then remove duplicate commas
      return (input) ? input.replace(/\s+/g, ' ').replace(/\s/g, ',').replace(/\,+/g, ',') : '';
    }
  }

}

