import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Headers, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { EventEmitterService } from '../../../core/services/event-emitter.service';
import {NgForm} from '@angular/forms';
// import {map} from 'rxjs/operators';
// import { of } from 'rxjs';
// import { Observable, Subject, asapScheduler, pipe, of, from,
//   interval, merge, fromEvent, } from 'rxjs';
//   import { map, filter } from 'rxjs/operators';
import { DataTableModule } from 'angular-6-datatable';


@Component({
  selector: 'app-view-candidate',
  templateUrl: './view-candidate.component.html',
  styleUrls: ['./view-candidate.component.css']
})
export class ViewCandidateComponent implements OnInit {
  log;
  logger:any={};
  candidateInfo:any ={
    data:{
      firstName:'',
      lastName:'',
      city:{name:''},
      state:{name:''},
      country:{name:''}
    }
  }
  addPayGrade={
      jobCode:'',
      candidateId:'',
      country:'',
      state:'',
      city:'',
      pay:'',
      payGrade:''
  }

  addSummary={
    jobCode:'',
    candidateId:'',
    summary:'',
    summaryUser:'',
    userType:''
    }
  job={
    jobCode:'',
	  candidateId:'',
  }

  summeryUsers=[];

  educationData;
  experienceData;
  skillsData;
  loading;
  headers: any;
  options: any;
  id;
  expectedPay=[{
                id:'',
                jobTitle:{jobTitle: '', companyName: ''},
                payRate:'',
                payGrade: {id: '', payFrequency: ''},
                location:
                    {
                      country: {countryId: '', countryName: ''},
                      state: {stateId: '', stateName: ''},
                      city: {cityId:'',cityName:''}
                    },
                  date:''}];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  jobcode;

  isShowPopup=false;
  payfrequency=false;
  summary=false;
  viewCommunicationMsg=false;
  payfrequencylist:any={};
  messageslist=[
    {
      userFlag:false,
      user:'',
      profilePic:'',
      msg:'',
      timestamp:''
    }
  ];

  success;
  error;
  test:any;
  skillsinfo = [];
  skillrate = [];
  skillname = [];
  constructor(private route: ActivatedRoute, public http: Http, private router: Router, public backLoc: Location, private service:UserService, private eventEmitter:EventEmitterService) {    
  }

  ngOnInit() {
    
    this.route.paramMap.subscribe(
      param => {
        this.id = param.get('id');
        this.addPayGrade.candidateId=param.get('id');
        this.addSummary.candidateId=param.get('id');
        this.job.candidateId=param.get('id');

       
        // console.log(this.id);
      }
    );
    this.logger.actionPath=this.router.url;
    this.logger.actionTitle='View Candidate';
    this.logger.comment='View Candidate by Id as'+this.id;
    this.service.adduserLogs(this.logger)
    .subscribe(response=>{
      this.log = response.json().data;
      this.eventEmitter.onRecentActivityRefresh();
    });

    // this.http.get('http://service.tedpros.com/job/getCandidate?id=' + this.id, this.options)
    this.service.getCandidateId(this.id)
      .subscribe(response => {
        this.candidateInfo = response.json();
        this.educationData = this.candidateInfo.data.education;
        this.experienceData = this.candidateInfo.data.experience;
        this.skillsData = this.candidateInfo.data.skills;

        const candidate={
          id:'',
          name:'',
          userType:'Candidate'
        };
        candidate.id=this.id;
        candidate.name=this.candidateInfo.data.firstName+' '+this.candidateInfo.data.lastName;
        this.summeryUsers.push(candidate);

        // chanhes by suresh 10-24-2019 start
        this.skillsData.forEach((obj) => {
          this.skillsinfo.push({ 'y': obj.experience, 'name': obj.skillName });
          this.skillname.push(obj.skillName);
          this.skillrate.push(obj.experience);
        });
        // chanhes by suresh 10-24-2019 end
      },
        error => {
          console.log(error);
        }
      );

      //modification done by BASIT023 start

      this.getexpectedPay();

      if(localStorage.getItem('applyJobId'))
      {
        this.jobcode=localStorage.getItem('applyJobId');
        this.addPayGrade.jobCode=this.jobcode;
        this.addSummary.jobCode=this.jobcode;
        this.job.jobCode=this.jobcode;
        // getjobDetails by job id
        this.service.getjobDetails(this.jobcode)
        .subscribe(response => {
          
          this.addPayGrade.country=response.json().data.country.id;
          this.addPayGrade.state=response.json().data.state.id;
          this.addPayGrade.city=response.json().data.city.id;  

          const recuriter={
            id:'',
            name:'',
            userType:'User'
          };
          recuriter.id=response.json().data.recruiter.userId;
          recuriter.name=response.json().data.recruiter.firstName+' '+response.json().data.recruiter.lastName;
          this.summeryUsers.push(recuriter);

          // get sales person user Info
          this.service.getUserInfo(response.json().data.postedBy)
          .subscribe(result => {
              // console.log(result.json().data);
              // this.test=result.json();
              const sales={
                id:'',
                name:'',
                userType:'User'
              };
              sales.id=result.json().user_id;
              sales.name=result.json().first_name+' '+result.json().last_name;
              this.summeryUsers.push(sales);
    
          });

        },
          error => {
            console.log(error);
          }
        );
     this.getcommunication();


        
      }
      else{
        this.jobcode='';
      }

      this.service.getPayFrequency()
      .subscribe(response => {
        // console.log(response.json().data);
        this.payfrequencylist=response.json().data;

      },
        error => {
          console.log(error);
        }
      );

      // getcommunicationMsg
      // modification done by BASIT023 end
  }
  goBack() {
    this.backLoc.back();
  }

  //modifications done by BASIT023 strat
  getcommunication()
  {
    this.service.getcommunicationMsg(this.job)
    .subscribe(response => {
      // console.log(response.json().data);
      this.messageslist=response.json().data;

    },
      error => {
        console.log(error);
      }
    );
  }
  payGrade()
  {
    this.payfrequency=true;
    this.isShowPopup=true;
    this.success='';
    this.error='';
    this.summary=false;
    this.viewCommunicationMsg=false;
  }

  summarypopup()
  {
    this.payfrequency=false;
    this.isShowPopup=true;
    this.success='';
    this.error='';
    this.summary=true;
    this.viewCommunicationMsg=false;
  }

  closePopup(){
    this.payfrequency=false;
    this.isShowPopup=false;
    this.summary=false;
    this.success='';
    this.error='';
    this.viewCommunicationMsg=false;

    this.addPayGrade.pay='';
    this.addPayGrade.payGrade='';
    this.addSummary.summary='';
    this.addSummary.summaryUser='';
  }

  addPayGradeInfo(addPayGrade,addExpectPayForm : NgForm)
  {
    this.service.addCandidateExpectedPay(addPayGrade)
    .subscribe(response => {
      // console.log(response);
      const result=response.json();
      if(result.statusCode.code==='200')
      {
        addExpectPayForm.reset();
        this.getexpectedPay();
        this.payfrequency=false;
        // this.isShowPopup=false;
        this.success='Candidated expected pay added';
        this.error='';
        this.summary=false;
        this.viewCommunicationMsg=false;
    
      }
      else
      {
        this.payfrequency=false;
        // this.isShowPopup=false;
        this.success='';
        this.summary=false;
        this.error=result.errorMessages;
        this.viewCommunicationMsg=false;
      }
    },
      error => {
        console.log(error);
      }
    );
    // console.log(addPayGrade);
  }

  addSummaryInfo(addSummary,addsummaryForm:NgForm)
  {
    this.service.addCandidateSummaryinfo(addSummary)
    .subscribe(response => {
      // console.log(response);
      const result=response.json();
      if(result.statusCode.code==='200')
      {
        addsummaryForm.reset();
        this.getexpectedPay();
        this.payfrequency=false;
        // this.isShowPopup=false;
        this.success='Candidated mail communication message added';
        this.error='';
        this.summary=false;
        this.viewCommunicationMsg=false;
        this.getcommunication();
    
      }
      else
      {
        this.payfrequency=false;
        // this.isShowPopup=false;
        this.success='';
        this.summary=false;
        this.error=result.errorMessages;
        this.viewCommunicationMsg=false;
      }
    },
      error => {
        console.log(error);
      }
    );
  }


  getexpectedPay(){
        this.service.getCandidateExpectedPay(this.id)
            .subscribe(response => {
              this.expectedPay=response.json().data;
              // console.log(this.expectedPay);
            },
              error => {
                console.log(error);
              }
            );
      }

  communicationUser(id)
  {
  //  console.log(id);
  if(id)
  {
   const userType = this.summeryUsers.filter(x =>{
      if(x.id===id)
      {
        return x.userType;
      }
    }
    );
    // console.log(userType[0].userType);
    this.addSummary.userType=userType[0].userType;
  }
  }

  communicationpopup()
  {
    this.payfrequency=false;
    this.isShowPopup=true;
    this.success='';
    this.error='';
    this.summary=false;
    this.viewCommunicationMsg=true;
  }



  //modifications done by BASIT023 end 


  // chanhes by suresh 10-24-2019 start
  
  onChartClick(event) {
    // console.log(event);
  }

   // CHART COLOR.
   pieChartColor: any = [
    {
      backgroundColor: ['rgba(30, 169, 224, 0.8)',
        'rgba(255,165,0,0.9)',
        'rgba(139, 136, 136, 0.9)',
        'rgba(255, 161, 181, 0.9)',
        'rgba(255, 102, 0, 0.9)',
        'rgba(74, 88, 188, 0.9)',
        'rgba(253, 46, 46, 0.9)',
        'rgba(4, 208, 1, 0.9)',
        'rgba(219, 42, 251, 0.9)',
        'rgba(3, 222, 202, 0.9)'
      ]
    }
  ]

   // ADD CHART OPTIONS. 
   pieChartOptions = {
    responsive: true
  }

  pieChartLabels = this.skillname;

  pieChartData: any = [
    {
      data: this.skillrate
    }
  ];

  // chanhes by suresh 10-24-2019 end

}
