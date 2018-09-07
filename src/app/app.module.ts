import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LogInComponent } from './log-in/log-in.component';
import { LandingComponent } from './landing/landing.component'
import { MaterialModule } from './material.module';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { HttpClientModule, HttpClient, HttpHeaders, HttpRequest,HttpParams} from '@angular/common/http';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SecurityQuestionsComponent } from './security-questions/security-questions.component';
import { AppTopNavComponent } from './app-top-nav/app-top-nav.component';
import { HomeComponent } from './home/home.component';
import { AngularFileUploaderModule, AngularFileUploaderComponent } from "angular-file-uploader";
import { UploadComponent } from './upload/upload.component';
import { ActionsComponent } from './actions/actions.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { CreateGroupService } from './services/creategroup.service';


@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    LandingComponent,
    ContactUsComponent,
    UserProfileComponent,
    CreateProfileComponent,
    ResetPasswordComponent,
    SecurityQuestionsComponent,
    AppTopNavComponent,
    HomeComponent,
    UploadComponent,
    ActionsComponent,
    CreateGroupComponent
  ],
  imports: [
    [ BrowserModule, FormsModule],
    AppRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFileUploaderModule,
    BrowserAnimationsModule
  ],
  providers: [ CreateGroupService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
