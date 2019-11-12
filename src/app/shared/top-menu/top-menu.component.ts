import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { first, count } from 'rxjs/operators';
import { AuthenticationService } from '../../core/services/authentication.service';
import { UserService } from '../../core/services/user.service';
import { EventEmitterService } from '../../core/services/event-emitter.service';
import { RightBarService } from '../../core/services/right-bar.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  personalInfo: any = {
    statusCode: {},
    data: {},
  };
  picturedata: any = {
    statusCode: {},
    data: {},
  };
  data: any = {
    statusCode: {},
    data: {
      personalInformation: {},
    },
  };
  url;
  file1_input;
  file2_input;
  themeForm;
  logoUrl;
  themeData: {
    themeColor: '',
    siteLogo: '',
    siteFav: ''

  };
  // expiryDetails={
  //   license:{
  //     licenseDetails:[]
  //   },
  //   certificate:{
  //     certificateDetails:[]
  //   }
  // };
  alertDetails = [];
  LicenseAlertCount;
  CertificateAlertCount;
  totalAlertCount;
  totalCount;
  docalertDetails: any = {
    i9AlertDetails: '',
    federalw4AlertDetails: '',
    statew4AlertDetails: '',
    workAuthAlertDetails: ''
  };
  finalCount: any;

  headers: any;
  options: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  userPermissions: any;
  submenuPermission: any;
  adminRole: any;

  constructor(private http: Http,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private authenticationService: AuthenticationService,
    private eventEmitterService: EventEmitterService,
    public sideNavService: RightBarService) {

    this.userPermissions = this.currentUser.permission;
    this.submenuPermission = this.currentUser.submenuPermission;
    this.adminRole = this.currentUser.Adminrole;

    this.service.getTheme()
      .subscribe(response => {
        this.logoUrl = response.json().data;
      });


    this.service.getPersonalInfo()
      .subscribe(response => {
        let datadetails = response.json();
        this.data = datadetails.data;
      },
        error => {
          console.log(error);
        });

    // get profile picture details
    this.service.getPersonalPicture()
      .subscribe(response => {
        let picturedetails = response.json();
        this.picturedata = picturedetails.data;
      },
        error => {
          console.log(error);
        });

    // call the function onload
    this.getDetails();
    this.getDocumentAlertDetails();

  }

  getDetails() {
    // get alerts
    this.service.getAlertDetails()
      .subscribe(response => {
        this.alertDetails = response.json().data;
        if (this.alertDetails != null) {
          this.totalAlertCount = this.alertDetails.length;
        }
      });
  }

  // get document alerts list
  getDocumentAlertDetails() {
    this.service.getDocumentAlertDetails()
      .subscribe(response => {
        this.docalertDetails = response.json().data;
        if (this.docalertDetails != null) {
          var countDoc = Object.keys(this.docalertDetails).length;
          if (this.alertDetails) {
            this.totalCount = this.alertDetails.length;
          } else {
            this.totalCount = 0;
          }
          this.finalCount = this.totalCount + Number(countDoc);
          // console.log(this.finalCount);
        }

      },
        error => {
          console.log(error);
        });
  }

  ngOnInit() {

    if (this.eventEmitterService.subsVar === undefined) {
      this.eventEmitterService.subsVar = this.eventEmitterService.
        invokeUserAlertRefresh.subscribe((name: string) => {
          this.getDetails();
          this.getDocumentAlertDetails();
        });
    }
    // this.http.get(' http://service.tedpros.com/config/getTheme')
    const result = JSON.parse(localStorage.getItem('settings'));
    this.themeData = result.data;
    // console.log(this.themeData);
    // this.file1_input = this.authenticationService.getBaseUrl()+this.themeData.siteLogo;
    // this.file2_input = this.authenticationService.getBaseUrl()+this.themeData.siteFav;

    this.file1_input = this.authenticationService.getBaseUrl() + '/frontend/logos/' + this.themeData.siteLogo;
    this.file2_input = this.authenticationService.getBaseUrl() + '/frontend/logos/' + this.themeData.siteFav;
  }

  appLogout() {
    this.authenticationService.logout();
    // localStorage.setItem('currentUser', '');
    // localStorage.clear();
    // this.router.navigate(['authorization/login']);
  }

}
