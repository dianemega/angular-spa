import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError , tap, zip } from 'rxjs/operators';
import { action } from '../model/action';

@Injectable()
export class ActionService {
  public apiEndpoint : string;
  actionSource = new BehaviorSubject(new action());
  action$ = this.actionSource.asObservable();

  constructor(private http: HttpClient) {
    this.apiEndpoint = '';
   }

  createAction(action:action): Observable<action> {
    this.actionSource.next(action);
    console.log("created action " + JSON.stringify(action));
    return this.action$;
  }

    // this doesn't exist yet, but the controller will route to the node.js login API call to validate credentials
/**    return this.http.post<action[]>(this.apiEndpoint + 'action',requestBody)
    .pipe(
      map(action => {
          this.actionSource.next(action);
          console.log("action " + action);
          return action;
      })
    ) **/
}
