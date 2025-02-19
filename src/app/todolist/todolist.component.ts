import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import {RouterOutlet} from '@angular/router'
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.scss']
})
export class TodolistComponent implements OnInit{
  taskArray: Array<any> = [];
  newtask: string = '';
  edited: boolean = false;
  editID: string | null = null;
  minDate: string = moment().format('YYYY-MM-DD');
  minTime: string = '2024-11-01 08:00';
  maxTime: string = '2024-11-01 18:00';
  APIURL: string = 'http://localhost:8000';

  constructor(private http: HttpClient) {
    this.get_tasks();
  }

  ngOnInit(): void {
    // const savedTasks = localStorage.getItem('tasks');
    // if (savedTasks) {
    //   this.taskArray = JSON.parse(savedTasks);
    // } 
    this.getPerson();
  }
  

  get_tasks() {
    this.http.get( 'http://localhost:8000/get_tasks').subscribe((res :any) => {
      console.log("S-au primit datele");
      this.taskArray = res;
    });
  }
  

  submit_task(form: NgForm){
    if(this.editID){
      this.updateTask(form);
    }
    else {
      this.add_tasks(form);
    }
  }


    add_tasks(form: NgForm) {
      if (form.invalid)
      return;
      
          const body = new FormData();
          // body.append('task', this.newtask);
          // body.append('id', uuid());
          body.append('descriere', form.controls['descriere'].value); 
          body.append('data', form.controls['date'].value); 
          body.append('ora', form.controls['time'].value); 
          body.append('person_id', this.selectedPersonId); 

        
          var body2={
            id: 123,
            nume: "Raluca"
          }
          
          this.http.post('http://localhost:8000/add_tasks', body).subscribe((res:any) => {
              // alert('S-a adaugat cu succes');
              console.log("Mesaj de la add_task");
              this.get_tasks();
              this.newtask = '';
            });
            form.reset();
            this.selectedPersonId = "";
            localStorage.setItem('tasks', JSON.stringify(this.taskArray)); 
        }
          


    delete_tasks(id: string) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      });
  
      swalWithBootstrapButtons.fire({
        title: 'Esti sigur ca vrei sa stergi aceasta sarcina?',
        text: 'Nu vei mai putea recupera sarcina!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Da, sterge sarcina!',
        cancelButtonText: 'Nu, anulează!'
      }).then((result) => {
        if (result.isConfirmed) {
        //   const body = new FormData();
        // body.append('id', id);
  
        this.http.delete('http://localhost:8000/delete_tasks/' + id).subscribe(() => {
            // alert('S-a sters');
            this.get_tasks();
          }
        );
          this.taskArray = this.taskArray.filter(task => task.id !== id);
          localStorage.setItem('tasks', JSON.stringify(this.taskArray));
          swalWithBootstrapButtons.fire('Sarcina a fost stearsa!', '', 'success');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Anulat', '', 'error');
        }
      });
      
    }

    updateTask(form: NgForm) {
      // const taskData = {
      //   // id: this.edited ? this.editID : uuid(),
      //   descriere: form.controls['descriere'].value,
      //   data: form.controls['date'].value,
      //   ora: form.controls['time'].value,
      //   isCompleted: false
      // };
      const body = new FormData();
      // body.append('task', this.newtask);
      // body.append('id', uuid());
      body.append('descriere', form.controls['descriere'].value); 
      body.append('data', form.controls['date'].value); 
      body.append('ora', form.controls['time'].value); 
      body.append('person_id', this.selectedPersonId); 

  
      if (this.edited) {
        this.http.put(`http://localhost:8000/update_tasks/`+ this.editID, body).subscribe(
          (res: any) => {
            
            const index = this.taskArray.findIndex(task => task.id === this.editID);
            this.taskArray[index].descriere = form.controls['descriere'].value;
            this.taskArray[index].data = form.controls['date'].value;
            this.taskArray[index].ora = form.controls['time'].value;
            this.taskArray[index].person_id = Number(this.selectedPersonId);

            this.edited = false;
            this.editID = null;
            form.reset();
            this.selectedPersonId = '';

          });
      } else {
        this.http.post('http://localhost:8000/add_tasks',body).subscribe(
          (res: any) => {
            this.taskArray.push(res);
            form.reset();
          });
      }
  
      // localStorage.setItem('tasks', JSON.stringify(this.taskArray));
    }



  // onSubmit(form: NgForm) {
  //   if (form.invalid) return;

  //   const taskData = {
  //     id: this.edited ? this.editID : uuid(),
  //     nume: form.controls['task'].value,
  //     date: form.controls['date'].value,
  //     time: form.controls['time'].value,
  //     isCompleted: false
  //   };

  //   if (this.edited) {
  //     const index = this.taskArray.findIndex(task => task.id === this.editID);
  //     this.taskArray[index] = taskData;
  //     this.edited = false;
  //     this.editID = null;
  //   } else {
  //     this.taskArray.push(taskData);
  //   }

  //   form.reset();
  //   localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  // }


  onEdit(id: string) {
    const task = this.taskArray.find(task => task.id === id);

    if (task) {
      this.edited = true;
      this.editID = id;

      (<HTMLInputElement>document.getElementById('descriere')).value = task.descriere;
      (<HTMLInputElement>document.getElementById('data')).value = moment(task.data).format("YYYY-MM-DD");
      (<HTMLInputElement>document.getElementById('ora')).value = task.ora;
      this.selectedPersonId = task.person_id?.toString() ?? "";

    }
  }


  // onDelete(id: string) {
  //   const swalWithBootstrapButtons = Swal.mixin({
  //     customClass: {
  //       confirmButton: 'btn btn-success',
  //       cancelButton: 'btn btn-danger'
  //     },
  //     buttonsStyling: false
  //   });

  //   swalWithBootstrapButtons.fire({
  //     title: 'Esti sigur ca vrei sa stergi aceasta sarcina?',
  //     text: 'Nu vei mai putea recupera sarcina!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Da, sterge sarcina!',
  //     cancelButtonText: 'Nu, anulează!'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const body = new FormData();
  //     body.append('id', id);

  //     this.http.post('http://localhost:8000/delete_tasks', body).subscribe(() => {
  //         // alert('S-a sters');
  //         this.get_tasks();
  //       }
  //     );
  //       this.taskArray = this.taskArray.filter(task => task.id !== id);
  //       localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  //       swalWithBootstrapButtons.fire('Sarcina a fost stearsa!', '', 'success');
  //     } else if (result.dismiss === Swal.DismissReason.cancel) {
  //       swalWithBootstrapButtons.fire('Anulat', '', 'error');
  //     }
  //   });
  // }


  onComplete(id: string) {
    const task = this.taskArray.find(task => task.id === id);
  
    if (task) {

      task.iscompleted = !task.iscompleted;
  
      const body = new FormData();
      body.append('isCompleted', task.iscompleted.toString());
  
      this.http.put(`http://localhost:8000/completed/${id}`, body).subscribe(() => {
        console.log(`Actualizat`);
        this.sortTasks();
  
        // localStorage.setItem('tasks', JSON.stringify(this.taskArray));
      });
    }
  }
  
  


  sortTasks() {
    this.taskArray = this.taskArray.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }

  
  tasksPerson: Array<any> = [];
  selectedPersonId: string = "";
  personsArray: Array<any> = [
  // { person_id: 1, person_name: "Maria", person_dob: "1999-12-12", person_role: "Gospodina"},
  // { person_id: 2, person_name: "Stefan", person_dob: "1979-02-04", person_role: "Mecanic"},
  // { person_id: 3, person_name: "Ioan Marius",person_dob: "2000-04-12", person_role: "Profesor"}
];

getPerson() {
  this.http.get('http://localhost:8000/get_person').subscribe((res: any) => {
    this.personsArray = res;
    console.log("Persoane primite:", this.personsArray);
  });
}

addPerson(form: NgForm) {
  if (form.invalid) return;

  const body = new FormData();
  body.append('person_name', form.controls['person_name'].value);
  body.append('person_dob', form.controls['person_dob'].value);
  body.append('person_role', form.controls['person_role'].value);

  this.http.post('http://localhost:8000/add_person', body).subscribe((res: any) => {
    this.getPerson(); 
    form.reset();
  });
}

deletePerson(id: number) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  });

  swalWithBootstrapButtons.fire({
    title: 'Esti sigur?',
    text: 'Aceasta actiune nu poate fi anulata!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Da, sterge!',
    cancelButtonText: 'Anuleaza'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete(`http://localhost:8000/delete_person/${id}`).subscribe(() => {
        console.log("Persoana stearsa cu succes!");
        this.getPerson(); 
        swalWithBootstrapButtons.fire('Sters!', 'Persoana a fost stearsa.', 'success');
      });
    }
  });
}
tasksForPerson: Array<any> = [];
selectedPersonName: string = "";

getTasksForPerson(personId: number, personName: string) {
  this.http.get(`http://localhost:8000/get_tasks_by_person/${personId}`).subscribe((res: any) => {
    this.tasksForPerson = res;
    this.selectedPersonName = personName;
    console.log("Task-urile pentru", personName, res);
  });
}


editedPerson: boolean = false;
editPersonID: number | null = null;

onEditPerson(person: any) {
  (<HTMLInputElement>document.getElementById('person_name')).value = person.person_name;
  (<HTMLInputElement>document.getElementById('person_dob')).value = moment(person.person_dob).format("YYYY-MM-DD");
  (<HTMLInputElement>document.getElementById('person_role')).value = person.person_role;
  
  this.editedPerson = true;
  this.editPersonID = person.person_id;
  
}
submitPerson(form: NgForm) {
  if (form.invalid) return;
  
  if (this.editedPerson && this.editPersonID !== null) {
    this.updatePerson(form);
  } else {
    this.addPerson(form);
  }
}
updatePerson(form: NgForm) {

  const body = new FormData();
  body.append('person_name', form.controls['person_name'].value);
  body.append('person_dob', form.controls['person_dob'].value);
  body.append('person_role', form.controls['person_role'].value);

  if(this.editPersonID){
  this.http.put(`http://localhost:8000/update_person/` +this.editPersonID, body)
    .subscribe((res: any) => {
         this.getPerson(); 
         this.editedPerson = false;
         this.editPersonID = null;
         form.reset();

    });
  }
}  

showPersonForm: boolean = false;
selectedPerson: any = null;

toggleAddPersonForm(): void {
  this.showPersonForm = !this.showPersonForm;
}

showPersonDetails(person: any) {
  this.selectedPerson = person;
}
}

