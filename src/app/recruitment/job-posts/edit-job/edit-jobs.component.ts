import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthenticationService, UserService } from '../../../core/services';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { EventEmitterService } from '../../../core/services/event-emitter.service';
import { PatternsService } from '../../../core/services/patterns.service';
import { FormsModule, NgForm } from '@angular/forms';
@Component({
  selector: 'app-edit-jobs',
  templateUrl: './edit-jobs.component.html',
  styleUrls: ['./edit-jobs.component.css']
})
export class EditJobsComponent implements OnInit {
  cusData: any = {
  };
  message = '';
  error;
  isShowPopup = false;
  skillBool;
  users;
  recuiters;
  industries;
  countries;
  recSel = [];
  loading = false;
  contacts;
  states;
  cities;
  company;
  recError = '';
  display: any;
  headers: any;
  options: any;
  data: any = {};
  jobData: any = {
    company: { id: '' },
    contact: { id: '' },
    job: { id: '' },
    city: { id: '' },
    state: { id: '' },
    country: { id: '' },
    recruiter: {},
    workAuthorisation: [],
    skill: [],
    perHour: {}
  };
  skill = {
    skillName: '',
    experience: ''
  };
  skillData = [];
  jobRes;
  companies;
  customers;
  billRate;
  perHour;
  jobTitles;
  authorizations;
  companyId;
  jobTitle;
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'first_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    itemsShowLimit: 1,
    closeDropDownOnSelection: true
  };
  filteredusers = [];
  workauth = [];
  zipError = '';
  payFrequencies = [];
  workauthSettings = {};
  selAuth = [];
  filteredAuth = [];
  dateError = '';
  workautherror;
  publishRate = false;
  editId: any;

  log;
  logger: any = {};
  jobtitlePattern;
  skillset;
  skillpopup;
  contactError: any = '';
  industriesData: any = {
    skillType: ''
  };

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  editcustomer = { userId: '', name: '', description: '' };
  constructor(private route: ActivatedRoute, public http: Http, private router: Router,
    public auth: AuthenticationService, public service: UserService, private blocation: Location,
    private eventEmitter: EventEmitterService, public pattern: PatternsService) {

    this.jobtitlePattern = this.pattern.jobTitlePattern;

    // disabled select all checkbox - sharmistha - 09-16-2019 - start    
    this.workauthSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      enableCheckAll: false
    };
    // disabled select all checkbox - sharmistha - 09-16-2019 - end

  }

  ngOnInit() {
    this.getSkills();
    this.route.paramMap.subscribe(
      param => {
        this.jobData.internalCode = param.get('id');
        // this.editId= this.jobData.internalCode;
        // console.log(this.editId);
      }
    );
    // console.log('edit',this.editId)
    this.logger.actionPath = this.router.url;
    this.logger.actionTitle = 'Edit Jobposting';
    this.logger.comment = 'Edit Jobposting by Id as ' + this.jobData.internalCode;
    this.service.adduserLogs(this.logger)
      .subscribe(response => {
        this.log = response.json().data;
        this.eventEmitter.onRecentActivityRefresh();
        // console.log(this.log)
      });

    // get work authorization list
    this.service.getWorkAuth()
      .subscribe(response => {
        this.workauth = response.json().data;
        this.loading = false;
      },
        error => {
          console.log(error);
        });

    // get pay frequency list
    // this.http.get('http://service.tedpros.com/employeemanagement/payFrequency', this.options)
    this.service.getPayFrequency()
      .subscribe(response => {
        this.payFrequencies = response.json().data;
        this.loading = false;
      },
        error => {
          console.log(error);
        });

    // this.http.get('http://service.tedpros.com/company/all/', this.options)
    this.service.getCompanies()
      .subscribe(response => {
        this.companies = response.json().data;
        // console.log(this.companies);
        this.loading = false;
      },
        error => {
          console.log(error);
        }
      );
    // this.http.get('http://service.tedpros.com/user/allDetails', this.options)
    this.service.getUsersList()
      .subscribe(response => {
        this.users = response.json();
        // console.log(this.users);
        this.users.forEach((type) => {
          if (type.employeeType.employeeType === 'Recruiter') {
            this.filteredusers.push(type);
          }
        });
        this.recuiters = this.filteredusers;
      },
        error => {
          console.log(error);
        });

    // this.http.get('http://service.tedpros.com/job/title', this.options)
    this.service.getJobTitles()
      .subscribe(response => {
        const responseData = response.json();
        this.jobTitles = responseData.data;
        this.loading = false;
        // console.log(this.jobTitles);
      },
        error => {
          console.log(error);
        }
      );


    // get countries list
    // this.http.get('http://service.tedpros.com/config/country/', this.options)
    this.service.getCountries()
      .subscribe(response => {
        this.countries = response.json().data;
        this.loading = false;
      },
        error => {
          console.log(error);
        });
    // this.http.get('http://service.tedpros.com/job/jobDetails?id=' + this.jobData.internalCode, this.options)
    this.service.getjobDetails(this.jobData.internalCode)
      .subscribe(response => {
        this.data = response.json();
        this.jobData = this.data.data;
        console.log(this.jobData);

        if (this.jobData.publishRate === '0') {
          this.publishRate = false;
        }
        console.log(this.jobData.publishRate);
        console.log(this.publishRate);
        // console.log(this.jobData.datePosted);
        if (this.jobData.workAuthorisation) {
          let workAuth;
          workAuth = this.jobData.workAuthorisation;
          workAuth.forEach(auth => {
            let ary = { id: '', name: '' };
            ary.id = auth.id;
            ary.name = auth.name;
            this.selAuth.push(ary);
          });
          let ifSix = 1;
          let ifSeven = 1;
          for (let ind = 0; ind < this.selAuth.length; ind++) {
            if (this.selAuth[ind].id === '6') {
              ifSix = 0;
              break;
            }
          }
          for (let ind = 0; ind < this.selAuth.length; ind++) {
            if (this.selAuth[ind].id === '7') {
              ifSeven = 0;
              break;
            }
          }
          if (ifSix) {
            this.selAuth.push({ id: '6', name: 'GC' });
          }
          if (ifSeven) {
            this.selAuth.push({ id: '7', name: 'US Citizen' });
          }
          this.filteredAuth = this.selAuth;

          // autoselect GC US Citizen
          console.log(this.filteredAuth);

        } else {
          this.filteredAuth = [];
          this.jobData.workAuthorisation = [];
        }
        if (this.jobData.recruiter) {
          this.recSel.push({ 'id': this.jobData.recruiter.userId, 'first_name': this.jobData.recruiter.firstName });
        } else {
          const recAry = { userId: '', firstName: '', lastName: '' };
          this.jobData.recruiter = recAry;
        }
        console.log(this.recSel);
        this.jobData.datePosted = new Date(this.jobData.datePosted);
        this.jobData.targetDate = new Date(this.jobData.targetDate);
        if (this.jobData.skill === null) {
          this.skillData = [];
        } else {
          this.skillData = this.jobData.skill;
        }
        this.getAddress();
        this.getcontacts(this.jobData.company.id);
        this.change(this.jobData.country.id);
        this.state(this.jobData.state.id);

        // console.log(this.jobData);

      },
        error => {
          console.log(error);
        }
      );
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'first_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      itemsShowLimit: 1,
      closeDropDownOnSelection: true
    };

  }

  onChange($event: any): void {
  }

  //saikumar 07/08/2019 started here
  getSkills() {
    this.service.getSkills()
      .subscribe(response => {
        this.skillset = response.json().data;
        this.loading = false;
        console.log(this.skillset);
      },
        error => {
          console.log(error);
        });
  }

  //saikumar 07/09/2019 ended here

  // on deselect gc or us citizen from work authorization
  OnItemDeSelect(item: any) {
    if (item.id === '6') {
      this.filteredAuth.push({ id: '6', name: 'GC' });
      this.filteredAuth = [...this.filteredAuth];
    } else if (item.id === '7') {
      this.filteredAuth.push({ id: '7', name: 'US Citizen' });
      this.filteredAuth = [...this.filteredAuth];
    }
    this.workautherror = 'GC or US Citizen cannot be deselected';
  }

  // on item select in work authorization
  onItemSelect(item: any) {
    this.workautherror = '';
  }


  closePopup() {
    this.isShowPopup = false;
  }



  dateValidate() {
    if (this.jobData.datePosted >= this.jobData.targetDate) {
      this.dateError = 'Please select a valid target date';
      this.jobData.targetDate = this.jobData.datePosted;
    } else {
      this.dateError = '';
    }
  }

  getAddress() {

    const zip = this.jobData.zipCode;
    this.zipError = null;
    // console.log(zip);
    if (zip !== null) {
      this.service.getAddress(zip)
        .subscribe(response => {
          const result = response.json();
          // console.log(result);
          if (result.statusCode.code === '200') {
            this.jobData.country.id = result.data.country.id;
            this.change(this.jobData.country.id);
            this.jobData.state.id = result.data.state.id;
            this.state(this.jobData.state.id);
            this.jobData.city.id = result.data.city.id;
          } else {
            this.jobData.zipCode = '';
            this.zipError = 'Please enter a valid zip code';
            // console.log('zipcode not found');
          }
        },
          error => {
            console.log(error);
          });
    }

  }


  // get contacts list based on company selected
  getcontacts(id) {
    // this.http.get('http://service.tedpros.com/contact/companyContact?id=' + id, this.options)
    this.service.getCompanyContacts(id)
      .subscribe(response => {
        this.contacts = response.json().data;
        this.loading = false;
        // console.log(this.contacts);
      },
        error => {
          console.log(error);
        }
      );
  }

  change(id) {
    // console.log(id);
    // this.http.get('http://service.tedpros.com/config/state/?id=' + id, this.options)
    this.service.getStates(id)
      .subscribe(response => {
        this.states = response.json().data;
        this.loading = false;
      },
        error => {
          console.log(error);
        });
  }

  state(id) {
    // console.log(id);
    // this.http.get('http://service.tedpros.com/config/city/?id=' + id, this.options)
    this.service.getCities(id)
      .subscribe(response => {
        this.cities = response.json().data;
        this.loading = false;
      },
        error => {
          console.log(error);
        });
  }

  checkPublishBill(event) {
    this.publishRate = event.target.checked;
    console.log(this.publishRate);
  }

  editJob() {
    this.jobData.workAuthorisation = [];
    this.jobData.skill = this.skillData;
    console.log(this.jobData);
    if (this.jobData.skill.length) {
      this.skillBool = '';
      console.log(this.filteredAuth);
      if (this.filteredAuth.length > 0) {
        this.error = null;
        this.filteredAuth.forEach(auth => {
          this.jobData.workAuthorisation.push(auth.id);
        });
      } else {
        this.loading = false;
        this.error = 'Atleast one work authorization must be selected';
        return '';
      }
      console.log(this.recSel);
      // if (this.recSel.length > 0) {
      //   this.jobData.recruiter.userId = this.recSel[0]['id'];
      // }
      // else {
      //   this.loading = false;
      //   this.recError = 'Select a recruiter';
      //   return '';
      // }
      console.log(this.jobData);
      this.jobData.datePosted = new DatePipe('en-US').transform(this.jobData.datePosted, 'yyyy-MM-dd');
      this.jobData.targetDate = new DatePipe('en-US').transform(this.jobData.targetDate, 'yyyy-MM-dd');
      this.jobData.skill = this.skillData;
      if (this.publishRate) {
        this.jobData.publishRate = '1';
      } else {
        this.jobData.publishRate = '0';
      }
      // this.http.post('http://service.tedpros.com/job/editJob', this.jobData, this.options)
      this.service.editJob(this.jobData)
        .subscribe(response => {
          this.jobRes = response.json();
          console.log(this.jobRes);
          if (this.jobRes.statusCode.code === '200') {
            // this.router.navigate(['jobs']);
            this.message = this.jobRes.data;
            this.isShowPopup = true;

          } else {
            // this.userData.roles = [];
            this.error = this.jobRes.errorMessages;
            this.loading = false;
            this.isShowPopup = true;
          }
        },
          error => {
            console.log(error);
          }
        );
    } else {
      this.skillBool = 'Please specify atleast one skill';
    }
  }

  cancel() {
    this.blocation.back();
  }


  // saikumar 07-09-2019 started here
  addnewskill() {
    this.skillpopup = true;
  }

  closeskillPopup() {
    this.skillpopup = !this.skillpopup;
  }
  //saikumar 07-09-2019 ended here


  // saikumar 07/09/2019 started here


  // saikumar 07/09/2019 started here
  addskill(skillType, addindFrm: NgForm) {
    this.loading = false;
    if (skillType !== "") {
      this.contactError = '';
      this.industriesData.skillType = skillType;
      this.service.postskills(this.industriesData).subscribe(response => {
        console.log(response);
        this.data = response.json();
        console.log(this.data);

        if (this.data.statusCode.code === '200') {

          this.closeskillPopup();
          addindFrm.resetForm();
        }
        else if (this.data.statusCode.code === '409') {
          this.contactError = this.data.errorMessages;
          console.log(this.contactError);
        }

        this.getSkills()
        this.cusData.skillType = this.data.data;

        console.log(this.cusData.skillType);
      });
    } else {
      this.loading = false;
      this.contactError = 'Fill required Fileds';

    }
  }

  // saikumar 07/09/2019 ended here
  // adding new record in the table display
  addSkill(addSkills: NgForm, skillName, name, experience) {
    console.log(skillName);
    console.log(experience);
    if (skillName !== '' && experience !== '') {

      let validBoolean = false;
      for (let index = 0; index < this.skillData.length; index++) {
        if (this.skillData[index].skillName.trim().toLowerCase() === skillName.trim().toLowerCase()) {
          validBoolean = true;
        }
      }
      if (validBoolean) {
        this.skillBool = 'Duplicate skill cannot be added';
      } else {

        for (let i = 0; i < this.skillset.length; i++) {
          if (this.skillset[i].id === skillName) {
            var name;
            name = this.skillset[i].name;
          }
          console.log(name)
        }
        this.skillBool = null;
        addSkills.resetForm();
        this.skill.skillName = '';
        this.skill.experience = '';
        const skill = {
          skillName: skillName,
          experience: experience,
          name: name
        };
        console.log(skill)
        this.skillData.push(skill);
        console.log(this.skillData)
      }
    }
    else {
      if (skillName === '' && experience !== '') {
        this.skillBool = 'Please specify Skill Name';
      }
      else if (experience === '' && skillName !== '') {
        this.skillBool = 'Please specify Experience';
      }
      else if (skillName === '' && experience === '') {
        this.skillBool = 'Please enter skill and experience';
      }
    }
  }

  removeErrorText() {
    if (this.skillBool) {
      this.skillBool = null;
    }
  }

  removeSkill(skill) {
    const index = this.skillData.indexOf(skill);
    this.skillData.splice(index, 1);
  }


}
