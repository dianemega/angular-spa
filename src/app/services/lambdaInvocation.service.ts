import { Injectable, OnInit } from '@angular/core';
import { Action } from '../model/Action';
import { User } from '../model/User';
import { MatDialog } from '@angular/material';
import { ActionDialogComponent } from './../action-dialog/action-dialog.component';
import * as AWS from 'aws-sdk';
import { CognitoUtil, Callback, LoggedInCallback } from './cognito.service';
import { environment } from '../../environments/environment';
import { ActionService } from './action.service';
import { Buffer } from 'buffer';
import { HomeComponent } from '../home/home.component';
import { CreateProfileService } from '../services/create-profile.service';
import { CognitoUserAttribute, ICognitoUserAttributeData } from 'amazon-cognito-identity-js';
import { AWSError } from 'aws-sdk';
import { LogInService } from '../services/log-in.service';
import { Group } from '../model/Group';
import { Router } from '@angular/router';
import { AppConf } from '../shared/conf/app.conf';

@Injectable()
export class LambdaInvocationService implements OnInit {

  region = environment.region;

  apiVersion = '2015-03-31';

  public cognitoUtil: CognitoUtil;
  groupsResult: any;
  myGroups = [];
  private conf = AppConf;
  pointsEarned;
  group: Group;

  constructor() {  }

  ngOnInit() {}

  // list all the actions created by the admins
  listActions(callback: LoggedInCallback) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = environment.region;
    const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
    const pullParams = {
      FunctionName: 'listActions',
      InvocationType: 'RequestResponse',
      LogType: 'None'
    };
    lambda.invoke(pullParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

  // get the actions for a user BY their username
  // TODO add same call to get ALL users without specifying the username
  getUserActions(callback: LoggedInCallback, user: User) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = environment.region;
    const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
    const pullParams = {
      FunctionName: 'getUserActions',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload:  JSON.stringify({
          httpMethod:  'GET',
          path:  '/userActions',
          resource:  '',
          queryStringParameters:  {},
            pathParameters:  {
              username: user.username
        }
      })
    };
    lambda.invoke(pullParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
     //   console.log('user action' + data.Payload);
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

  // get all of the users - need to put a distinct filter on the result
  listUsers(callback: LoggedInCallback) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = environment.region;
    const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
    const pullParams = {
      FunctionName: 'listUserActions',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload:  JSON.stringify({
          httpMethod:  'GET',
          path:  '/actions',
          resource:  '',
          queryStringParameters:  {},
            pathParameters:  {}
      })
    };
    lambda.invoke(pullParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
     //   console.log('user action' + data.Payload);
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

   // Records points when a user takes an action
   performAction(callback: LoggedInCallback, user: User, action: Action) {
     // needed for create group method (to udpate group points per user)
    this.pointsEarned = action.eligiblePoints;
    const JSON_BODY = {
      username: user.username,
      actionTaken: action.name,
      email: user.email,
      pointsEarned: this.pointsEarned,
      carbonPoints: action.carbonPoints,
      recordedFrequency: 1,
      zipcode: user.address
    };
    const body = new Buffer(JSON.stringify(JSON_BODY)).toString('utf8');

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = this.region;
    const lambda = new AWS.Lambda({region: this.region, apiVersion: this.apiVersion});
    const putParams = {
      FunctionName: 'createUserActions',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/userActions',
        resource: '',
        queryStringParameters: {
        },
        pathParameters: {
        },
        body: body
      })
    };

    lambda.invoke(putParams, function(error, data) {
      if (error) {
        console.log(error);
        callback.callbackWithParams(error, null);
      } else {
        console.log('perform action data ' + data);
         callback.callbackWithParams(null, data.Payload);

      }
    });
  }

  // Allow admins to delete an action - bulk or single
  adminDeleteAction(actionData: Action[], callback: LoggedInCallback) {
    const body = new Buffer(JSON.stringify(actionData)).toString('utf8');

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = this.region;
    const lambda = new AWS.Lambda({region: this.region, apiVersion: this.apiVersion});
    const putParams = {
      FunctionName: 'deleteActions',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/actions/delete',
        resource: '',
        queryStringParameters: {
        },
        pathParameters: {
        },
        body: body
      })
    };
    lambda.invoke(putParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

  // Allow admins to add more actions for users to take
  adminCreateAction(actionData: Action, callback: LoggedInCallback) {
    console.log('action Data ' + JSON.stringify(actionData));
    const JSON_BODY = {
      name: actionData.name,
      eligiblePoints: actionData.eligiblePoints,
      funFactImageUrl: actionData.funFactImageUrl,
      funFact: actionData.funFact,
      maxFrequency: actionData.maxFrequency,
      tileIconUrl: actionData.tileIconUrl,
      frequencyCadence: actionData.frequencyCadence // ,
      // TODO: assignmentUrl: actionData.assignmentUrl,
      // carbonPoints: actionData.carbonPoints
    };

    const body = new Buffer(JSON.stringify(JSON_BODY)).toString('utf8');

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = this.region;
    const lambda = new AWS.Lambda({region: this.region, apiVersion: this.apiVersion});
    const putParams = {
      FunctionName: 'createActions',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/actions',
        resource: '',
        queryStringParameters: {
        },
        pathParameters: {
        },
        body: body
      })
    };
    lambda.invoke(putParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

   // Admin function - get all of the meta data for groups - categories and subcategories
   listGroupsMetaData(callback: LoggedInCallback) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = environment.region;
    const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
    const pullParams = {
      FunctionName: 'listAdminData',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload:  JSON.stringify({
          httpMethod:  'GET',
          path:  '/adminData',
          resource:  '',
          queryStringParameters:  {},
            pathParameters:  {}
      })
    };
   lambda.invoke(pullParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

   // Get group data by group name
   getGroupMembers(callback: LoggedInCallback, group: Group) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = environment.region;
    const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
    const pullParams = {
      FunctionName: 'getGroups',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload:  JSON.stringify({
          httpMethod:  'GET',
          path:  '/groups',
          resource:  '',
          queryStringParameters:  {
            name: group.name
          },
            pathParameters:  {}
      })
    };
   lambda.invoke(pullParams, function(error, data) {
      if (error) {
        callback.callbackWithParams(error, null);
      } else {
         console.log('group data for specified group ' + group.name + '' + data.Payload);
        callback.callbackWithParams(null, data.Payload);
      }
    });
  }

     // Get all group data
     getAllGroups(callback: Callback) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
      AWS.config.region = environment.region;
      const lambda = new AWS.Lambda({region: AWS.config.region, apiVersion: '2015-03-31'});
      const pullParams = {
        FunctionName: 'listGroups',
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload:  JSON.stringify({
            httpMethod:  'GET',
            path:  '/groups/list',
            resource:  '',
            queryStringParameters:  {},
              pathParameters:  {}
        })
      };
     lambda.invoke(pullParams, function(error, data) {
        if (error) {
          callback.cognitoCallbackWithParam(error);
        } else {
       //    console.log('ALL groups' + data.Payload);
          callback.cognitoCallbackWithParam(data.Payload); // at the bottom of this class
        }
      });
    }

  // Allow Users to create/update a group
  createGroup(groupData: any, callback: Callback) {
    const JSON_BODY = [{
      name: groupData.name,
      username: groupData.groupLeader,
      zipCode: groupData.zipcode,
      groupType: groupData.type,
      groupSubType: groupData.groupSubType, // different than the array for metaData
      description: groupData.description,
      groupAvatar: groupData.groupAvatar,
      members: groupData.groupMembers,
      pointsEarned: groupData.pointsEarned
    }];
    // need to do a summation of points earned with the group total points
 /**   const JSON_BODY = [];
    for (let i = 0; i < groupData.length; i++) {
      JSON_BODY.push({
        name: groupData[i].name,
        username: groupData[i].groupLeader,
        zipCode: groupData[i].zipcode,
        groupType: groupData[i].type,
        groupSubType: groupData[i].groupSubType, // different than the array for metaData
        description: groupData[i].description,
        groupAvatar: groupData[i].groupAvatar,
        members: groupData[i].groupMembers,
        pointsEarned: groupData[i].pointsEarned
      });
    } **/

    const body = new Buffer(JSON.stringify(JSON_BODY)).toString('utf8');

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: environment.identityPoolId});
    AWS.config.region = this.region;
    const lambda = new AWS.Lambda({region: this.region, apiVersion: this.apiVersion});
    const putParams = {
      FunctionName: 'createGroups',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/groups',
        resource: '',
        queryStringParameters: {
        },
        pathParameters: {
        },
        body: body
      })
    };
    lambda.invoke(putParams, function(error, data) {
      if (error) {
    //    console.log('ERROR ' + JSON.stringify(error));
        callback.callbackWithParameters(error, null);
      } else {
          callback.callbackWithParameters(null, data.Payload);
        //  window.location.reload();
      }
    });
  }

}
