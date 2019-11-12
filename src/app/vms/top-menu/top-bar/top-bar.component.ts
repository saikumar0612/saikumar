import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { VmsCandidateService } from '../../../core/services/vmsCandidate.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  file1_input;
  file2_input;
  themeData = {
    themeColor: '',
    siteLogo: '',
    siteFav: ''
  }; 
  userData:any = {};
  candidateUser = JSON.parse(localStorage.getItem('candidateUserData'));
  candidateData: any;
  constructor(private authenticationService:AuthenticationService, private service:VmsCandidateService) { 
    
  }

  ngOnInit() { 
    this.candidateData = this.candidateUser.data.email;
    const result = JSON.parse(localStorage.getItem('settings'));
    this.themeData = result.data;
    this.file1_input = this.authenticationService.getBaseUrl() +'/frontend/logos/'+ this.themeData.siteLogo;
    this.file2_input = this.authenticationService.getBaseUrl() +'/frontend/logos/'+ this.themeData.siteFav;


    this.service.getCandidatePersonal(this.candidateData).subscribe(res=>{
      this.userData = res.json().data;
    });
  };

  logout(){
    this.authenticationService.candidatelogout();
  }

}
