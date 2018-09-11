import { Component, OnInit } from '@angular/core';
import { CreateProfileService } from '../services/create-profile.service';
import { CognitoCallback } from '../services/cognito.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm-sign-up',
  templateUrl: './confirm-sign-up.component.html',
  styleUrls: ['./confirm-sign-up.component.scss']
})
export class ConfirmSignUpComponent implements OnInit {

  verificationCode: string = '';
  username: string = '';
  errorMessage: string = '';
  private sub: any;

  constructor(public createProfileService: CreateProfileService, public router: Router, public route: ActivatedRoute) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.username = params['username'];

    });
    console.log('verificationCode is ' + this.verificationCode);
  }

  confirmVerificationCode() {
    this.createProfileService.confirmVerificationCode(this.username, this.verificationCode, this);
  }

  cognitoCallback(message: string, result: any) {
    if (message != null) {
      this.errorMessage = message;
      console.log('message: ' + this.errorMessage);
    } else {
      // move to the next step
      this.router.navigate(['/home']);
    }
  }

}
