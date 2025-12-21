import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
selector : 'app-staff-layout',
standalone:true,
imports:[CommonModule,RouterLink,RouterOutlet],
templateUrl:`./staff-layout.component.html`,
  styleUrls: [`./staff-layout.component.css`]
}) 

export class StaffLayoutComponent implements OnInit{
    currentUser:User|null=null;

    constructor(
        private authService:AuthService,
        private router:Router
    ){}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user =>{
            this.currentUser = user;
        });
    }
    logout():void{
        if(confirm('Are you sure you want to logout ?')){
            this.authService.logout();
            this.router.navigate(['/login']);
        }
    }
}