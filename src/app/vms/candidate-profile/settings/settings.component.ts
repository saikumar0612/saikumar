import { Component, OnInit } from '@angular/core';
import { VmsCandidateService } from '../../../core/services/vmsCandidate.service';
import { DatePipe , Location} from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MailService } from '../../../core/services/mail.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  workData;
  today = new Date();
  formDisplay:boolean = false;
  result;
  submitData:any = {};
  candidateUser;
  candidateId;
  data;
  letterData:any={};
  deletingData:any={};
  resuletData;
  special_offer;
  tedCommunication;
  newsLetter;
  accountData:any;
  coverLetterDetails:boolean = false;
  letterDetails:any = {
    title:'',
    letter:''
  };
  deleteData:any;
  passwordPopup:any;
  changesData:any ={
    password:'',
    cpassword:'',
    oldPassword:'',
    id:''
  };
  changeEmailData:any = {};
  response;
  error;
  emailPopup:any;
  emailData :any = {};
  emailError = '';
  filterData:any={email:''}
  constructor(private service :VmsCandidateService, private location:Location, private router:Router, private authenticationService:AuthenticationService, private mailService: MailService) { }

  ngOnInit() {
    
    this.candidateUser = JSON.parse(localStorage.getItem('candidateUserData'));
    this.candidateId = this.candidateUser.data.id;

    this.service.getCandidatePersonal(this.candidateUser.data.email)
    .subscribe(response => {
      this.data = response.json();
      this.filterData = this.data.data;
     console.log(this.filterData);
    },
      error => {
        console.log(error);
      }
    );
    // get work authentication

    this.service.getWorkAuth().subscribe(res=>{
      this.workData = res.json().data;
    });

    // get account details 

    this.service.getCanAccountDetails().subscribe(res=>{
      this.accountData = res.json().data;
      console.log(this.accountData);
      this.submitData.workAuth = this.accountData.workAuth.id;
      this.submitData.to_change = this.accountData.to_change;
      
      this.submitData.newsLetter = this.accountData.newsLetter;
      this.submitData.special_offer = this.accountData.special_offer;
      this.submitData.tedCommunication = this.accountData.tedCommunication;
      if(this.submitData.newsLetter === '1'){
        this.newsLetter  = true;
      }else{
        this.newsLetter  = false;
      }
      if(this.submitData.special_offer === '1'){
        this.special_offer  = true;
      }else{
        this.special_offer  = false;
      }
      if(this.submitData.tedCommunication === '1'){
        this.tedCommunication  = true;
      }else{
        this.tedCommunication  = false;
      }
      
    });
    this.getCoverLetter();
  }

      // get cover letters data
  getCoverLetter(){
    this.service.getCoverLetters().subscribe(res=>{
      this.resuletData = res.json().data;
      console.log(this.resuletData);
    });
  }

  

  addCoverLetter(){
    this.formDisplay = true;
  }
  closeOfferLetter(letterFrm:NgForm){
    this.formDisplay = false;
    letterFrm.resetForm();
  }

  addCoverletter(letterFrm:NgForm){
    this.letterData.candidateId = this.candidateId ;
    this.letterData.date =  new DatePipe('en-US').transform(this.today, 'yyyy-MM-dd');
    this.service.addCoverletter(this.letterData).subscribe(res=>{
      this.data = res.json();
      console.log(this.data);
      if(this.data.statusCode.code === '200'){
        letterFrm.resetForm();
        this.formDisplay = false;
        this.getCoverLetter();
        // this.closeOfferLetter(letterFrm:NgForm)
      }
    });
  }

  addInfo(){
    if(this.special_offer){
      this.special_offer = 1;
    }else{
      this.special_offer = 0;
    }
    if(this.tedCommunication){
      this.tedCommunication = 1;
    }else{
      this.tedCommunication = 0;
    }
    if(this.newsLetter){
      this.newsLetter = 1;
    }else{
      this.newsLetter = 0;
      console.log(this.newsLetter)
    }
    this.submitData.candidateId = this.candidateId ;
    this.submitData.special_offer = this.special_offer ;
    this.submitData.tedCommunication = this.tedCommunication ;
    this.submitData.newsLetter = this.newsLetter ;
    this.service.candidatesSettings(this.submitData).subscribe(res=>{
      this.result = res.json();
      console.log(this.result);
      // addInfo.resetForm();
    });
  }

  cancel(){
    this.location.back();
  }

  openPopup(id){
    console.log(id);
    this.coverLetterDetails = true;
    this.service.getCoverLettersById(id).subscribe(res=>{
      this.letterDetails = res.json().data;
      console.log(this.letterDetails);
    })
  }

  closePopup(){
    this.coverLetterDetails = false;
  }

  delete(id){
    console.log(id);
    this.deletingData.latterId = id;
    this.service.deleteCandidateCoverLetter(this.deletingData).subscribe(res=>{
      this.deleteData = res.json();
      console.log(this.deleteData);
      if(this.deleteData.statusCode.code === '200'){
        this.getCoverLetter();
      }
    })
  }

  password(){
    this.passwordPopup = true;
  }
  closePasswordPopup(passwordForm:NgForm){
    this.passwordPopup = false;
    passwordForm.resetForm();
  }

  changePassword(passwordForm:NgForm){
    this.changesData.id= this.candidateId ;
    // console.log(this.changesData)
    this.service.changeCandidatePassword(this.changesData).subscribe(res=>{
      this.response = res.json();
      console.log(this.response)
      if(this.response.statusCode.code === '200'){
        passwordForm.resetForm();
        this.router.navigate(['/vms/candidate-login-register']);
      }
      else if(this.response.statusCode.code === '409'){
        this.error = this.response.errorMessages;
      }
    });
  }

  closeEmailPopup(){
    this.emailPopup = false;
  }

  email(){
    this.emailPopup = true;
  }

  changeEmail(){
    console.log(this.changeEmailData);
    // this.service.changeCandidateEmail(this.changeEmailData).subscribe(res=>{
    //   const responce = res.json();
    //   console.log(responce);
    // });

  }

  checkMail() {
    const email = this.changeEmailData.email;
    this.authenticationService.checkRegisterEmail(email)
      .subscribe(response => {
        const result = response.json();
        if (result.statusCode.code === '409') {
          this.changeEmailData.email = '';
          this.emailError = 'This email is already registered';
        } else {
          this.emailError = '';
          this.getPHPListToken();
          this.mailService.addSubscriber(email)
            .subscribe(resp => {
              console.log('Add email');
              console.log(resp);
            },
              error => {
                console.log(error);
              });
        }
      },
        error => {
          console.log(error);
        });
  }

  getPHPListToken() {
    this.mailService.createSession('admin', 'Pass12!@')
      .subscribe(resp => {
        console.log('generate token');
        console.log(resp);
      },
        error => {
          console.log(error);
        });
  }


}
