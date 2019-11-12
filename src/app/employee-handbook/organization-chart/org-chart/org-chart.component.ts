import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services';
import { Location } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
declare var $: any;
@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.css']
})
export class OrgChartComponent implements OnInit {
  
// added image attribute - sharmistha - 08-06-2019 - start
  userData:any;
  // orgData: OrgData= {
  //   name: '',
  //   type: '',
  //   img:'',
  //   id:'',
  //   children: []
  // };
  orgData = {};
  loading = false;
  title1 = 'Tour of Heroes';
  // added image attribute - sharmistha - 08-06-2019 - end


  constructor(public http: Http, public auth: AuthenticationService, public service: UserService) { }

  getOrgChart(){
    this.loading = true;
    this.service.getOrgChart()
      .subscribe(response => {
        this.userData = response.json().data;
        this.loading = false;
        // console.log(this.userData);
        this.orgData = this.userData[0];
      })
  }

  ngOnInit() {
    // this.getOrgChart();
    this.loading = true;
    
    $(document).ready(function () {
      this.service.getOrgChart()
      .subscribe(response => {
        this.userData = response.json().data;
        this.loading = false;
        this.orgData = this.userData[0];
        console.log(this.orgData);
        // var nodeTemplate = function(data) {
        //   return `   
        //     <div class="office" style="width: 38px; height: 38px; margin: auto;transform: rotate(-90deg) rotateY(180deg);"><img src="${data.img}" style="width: 100%; border-radius: 50px;"/></div>         
        //     <div class="title">${data.name}</div>
        //     <div class="content">${data.type}</div>
        //   `;
        // }
        var oc = $('#org').orgchart({
          'data': this.orgData,
          'nodeContent': 'type',
          'direction': 'l2r',
          'visibleLevel': 4,
          'verticalLevel': 3,
          'createNode': function($node, data) {
            $node.children('.title').wrapInner('<a href="/usersView/view-user-profile/' + data.id + '" style="color:#fff;"></a>');
          }
          // 'nodeTemplate': nodeTemplate
        });

        $("#btn-filter-node").on("click", function() {                                                                                     
          filterNodes($("#key-word").val());
        });
    
        $("#btn-cancel").on("click", function() {
          clearFilterResult();
        });

        function filterNodes(keyWord) {
          if (!keyWord.length) {
            window.alert("Please type key word firstly.");
            return;
          } else {
            var $chart = $(".orgchart");
            // disalbe the expand/collapse feture
            $chart.addClass("collapsable");
            // distinguish the matched nodes and the unmatched nodes according to the given key word
            $chart
              .find(".node")
              .filter(function(index, node) {
                return (
                  $(node)
                    .text()
                    .toLowerCase()
                    .indexOf(keyWord) > -1
                );
              })
              .addClass("matched")
              .addClass("product-dept")
              .closest("table")
              .parents("table")
              .find("tr:first")
              .find(".node")
              .addClass("retained");
            // hide the unmatched nodes
            $chart.find(".matched,.retained").each(function(index, node) {
              $(node)
                .removeClass("slide-up")
                .closest(".nodes")
                .removeClass("hidden")
                .siblings(".lines")
                .removeClass("hidden");
              var $unmatched = $(node)
                .closest("table")
                .parent()
                .siblings()
                .find(".node:first:not(.matched,.retained)")
                .closest("table")
                .parent()
                .addClass("hidden");
              $unmatched
                .parent()
                .prev()
                .children()
                .slice(1, $unmatched.length * 2 + 1)
                .addClass("hidden");
            });
            // hide the redundant descendant nodes of the matched nodes
            $chart.find(".matched").each(function(index, node) {
              if (
                !$(node)
                  .closest("tr")
                  .siblings(":last")
                  .find(".matched").length
              ) {
                $(node)
                  .closest("tr")
                  .siblings()
                  .addClass("hidden");
              }
            });
          }
        }

        function clearFilterResult() {
          $(".orgchart")
            .removeClass("noncollapsable")
            .find(".node")
            .removeClass("matched retained")
            .end()
            .find(".hidden")
            .removeClass("hidden")
            .end()
            .find(".slide-up, .slide-left, .slide-right")
            .removeClass("slide-up slide-right slide-left");

          $("#key-word").val("");
        }

        $("#key-word").on("keyup", function(event) {
          if (event.which === 13) {
            filterNodes(this.value);
          } else if (event.which === 8 && this.value.length === 0) {
            clearFilterResult();
          }
        });

      });
    }.bind(this));
  }

}
