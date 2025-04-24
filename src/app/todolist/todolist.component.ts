import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { read, utils, writeFile } from 'xlsx';
// alte importuri...
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.scss']
})
export class TodolistComponent implements OnInit {
  @ViewChild('importFile') importFile!: ElementRef;

  // Sarcini
  taskArray: Array<any> = [];
  newtask: string = '';
  edited: boolean = false;
  editID: string | null = null;

  //Ora
  minDate: string = moment().format('YYYY-MM-DD');
  minTime: string = '2024-11-01T08:00';
  maxTime: string = '2024-11-01T18:00';

  APIURL: string = 'http://localhost:8000';

  // Persoana
  personsArray: Array<any> = [];
  selectedPersonId: string = "";
  showPersonForm: boolean = false;
  selectedPerson: any = null;
  tasksPerson: Array<any> = [];
  selectedPersonName: string = "";
  editedPerson: boolean = false;
  editPersonID: number | null = null;

  // Calendar
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    events: []  
  };

  constructor(private http: HttpClient) {
    this.get_tasks();
  }

  ngOnInit(): void {
    this.getPerson();
  }


  get_tasks() {
    this.http.get('http://localhost:8000/get_tasks')
      .subscribe((res: any) => {
        console.log("S-au primit datele de la /get_tasks");
        this.taskArray = res;
        this.setCalendarEventsFromTasks();
      });
  }

  submit_task(form: NgForm) {
    if (this.editID) {
      this.updateTask(form);
    } else {
      this.add_tasks(form);
    }
  }

  add_tasks(form: NgForm) {
    if (form.invalid) return;

    const body = new FormData();
    body.append('descriere', form.controls['descriere'].value);
    body.append('data', form.controls['date'].value);
    body.append('ora', form.controls['time'].value);
    body.append('person_id', this.selectedPersonId);
    body.append('difficulty', form.controls['difficulty'].value);

    this.http.post('http://localhost:8000/add_tasks', body)
      .subscribe((res: any) => {
        console.log("Mesaj de la /add_tasks:", res);
        this.get_tasks();
        this.newtask = '';
      });

    form.reset();
    this.selectedPersonId = "";
    localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  }

  updateTask(form: NgForm) {
    const body = new FormData();
    body.append('descriere', form.controls['descriere'].value);
    body.append('data', form.controls['date'].value);
    body.append('ora', form.controls['time'].value);
    body.append('person_id', this.selectedPersonId);
    body.append('difficulty', form.controls['difficulty'].value);

    if (this.edited) {
      this.http.put(`http://localhost:8000/update_tasks/${this.editID}`, body)
        .subscribe((res: any) => {
          const index = this.taskArray.findIndex(task => task.id === this.editID);
          if (index !== -1) {
            this.taskArray[index].descriere = form.controls['descriere'].value;
            this.taskArray[index].data = form.controls['date'].value;
            this.taskArray[index].ora = form.controls['time'].value;
            this.taskArray[index].person_id = Number(this.selectedPersonId);
            this.taskArray[index].difficulty = form.controls['difficulty'].value;
          }

          this.edited = false;
          this.editID = null;
          form.reset();
          this.selectedPersonId = '';
          this.setCalendarEventsFromTasks();
        });
    } else {
      this.http.post('http://localhost:8000/add_tasks', body)
        .subscribe((res: any) => {
          this.taskArray.push(res);
          form.reset();
          this.setCalendarEventsFromTasks();
        });
    }
  }

  onEdit(id: string) {
    const task = this.taskArray.find(task => task.id === id);
    if (task) {
      this.edited = true;
      this.editID = id;
      (document.getElementById('descriere') as HTMLInputElement).value = task.descriere;
      (document.getElementById('data') as HTMLInputElement).value = moment(task.data).format("YYYY-MM-DD");
      (document.getElementById('ora') as HTMLInputElement).value = task.ora;
      this.selectedPersonId = task.person_id?.toString() ?? "";
      (document.getElementById('difficulty') as HTMLSelectElement).value = task.difficulty;
    }
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
      cancelButtonText: 'Nu, anuleaza!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete('http://localhost:8000/delete_tasks/' + id)
          .subscribe(() => {
            this.get_tasks();
          });
        this.taskArray = this.taskArray.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(this.taskArray));
        swalWithBootstrapButtons.fire('Stearsa!', '', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire('Anulat', '', 'error');
      }
    });
  }

  onComplete(id: string) {
    const task = this.taskArray.find(task => task.id === id);
    if (task) {
      task.iscompleted = !task.iscompleted;
      const body = new FormData();
      body.append('isCompleted', task.iscompleted.toString());
      this.http.put(`http://localhost:8000/completed/${id}`, body)
        .subscribe(() => {
          console.log("Actualizat");
          this.sortTasks();
          this.setCalendarEventsFromTasks();
        });
    }
  }

  sortTasks() {
    this.taskArray = this.taskArray.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }


  getPerson() {
    this.http.get('http://localhost:8000/get_person')
      .subscribe((res: any) => {
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

    this.http.post('http://localhost:8000/add_person', body)
      .subscribe((res: any) => {
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
      text: 'Aceasta acțiune nu poate fi anulata!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da, sterge!',
      cancelButtonText: 'Anuleaza'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:8000/delete_person/${id}`)
          .subscribe(() => {
            console.log("Persoana stearsa cu succes!");
            this.getPerson();
            swalWithBootstrapButtons.fire('Stearsa!', 'Persoana a fost stearsa.', 'success');
          });
      }
    });
  }

  getTasksForPerson(personId: number, personName: string) {
    this.http.get(`http://localhost:8000/get_tasks_by_person/${personId}`)
      .subscribe((res: any) => {
        this.tasksPerson = res;
        this.selectedPersonName = personName;
        console.log("Task-urile pentru", personName, res);
      });
  }

  onEditPerson(person: any) {
    this.showPersonForm = true;
    this.editedPerson = true;
    this.editPersonID = person.person_id;

    setTimeout(() => {
      (document.getElementById('person_name') as HTMLInputElement).value = person.person_name;
      (document.getElementById('person_dob') as HTMLInputElement).value = moment(person.person_dob).format("YYYY-MM-DD");
      (document.getElementById('person_role') as HTMLInputElement).value = person.person_role;
    });
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

    if (this.editPersonID) {
      this.http.put(`http://localhost:8000/update_person/${this.editPersonID}`, body)
        .subscribe((res: any) => {
          this.getPerson();
          this.editedPerson = false;
          this.editPersonID = null;
          form.reset();
        });
    }
  }

  toggleAddPersonForm(): void {
    this.showPersonForm = !this.showPersonForm;
  }

  showPersonDetails(person: any) {
    this.selectedPerson = person;
  }



  setCalendarEventsFromTasks(): void {
    const colors: { [key: string]: string } = {
      usor: '#28a745',   
      mediu: '#ffc107',  
      greu: '#fd7e14',   
      extrem: '#dc3545'  
    };

    const events = this.taskArray.map(task => {
      const start = `${moment(task.data).format('YYYY-MM-DD')}T${task.ora}`;
      const color = colors[task.difficulty];

      return {
        title: `${task.descriere} - ${task.person_name}`,
        start,
        allDay: false,
        backgroundColor: color,
  
      };
    });

    this.calendarOptions.events = events;
  }



 /* ===========================================
   ============  EXPORT PDF  ==================
   =========================================== */
exportPDF(): void {
  /* 1) inițializează documentul */
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  /* 2) antet simplu */
  doc.setFontSize(16);
  doc.text('Lista de sarcini', 14, 15);

  /* 3) transformă taskArray → rânduri tabel */
  const rows = this.taskArray.map((t, i) => ([
    i + 1,
    t.descriere,
    moment(t.data).format('YYYY-MM-DD'),
    t.ora,
    t.person_name,
    t.difficulty,
    t.iscompleted ? 'Completat' : 'În așteptare'
  ]));

  /* 4) desenează tabelul */
  autoTable(doc, {
    head: [['#', 'Descriere', 'Data', 'Ora', 'Persoana', 'Dificultate', 'Status']],
    body: rows,
    startY: 22,          // puțin sub titlu
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69] }   // roșu (Bootstrap danger)
  });

  /* 5) descarcă fișierul */
  doc.save('taskuri.pdf');
}



/** fișierul ales de utilizator (sau null) */
selectedImage: File | null = null;
/** preview base64 pentru <img> */
imagePreview: string | null = null;

onImageSelected(input: HTMLInputElement): void {
  if (!input.files || input.files.length === 0) {
    this.selectedImage = null;
    this.imagePreview  = null;
    return;
  }

  this.selectedImage = input.files[0];

  // generează preview (Base64)
  const reader = new FileReader();
  reader.onload = () => (this.imagePreview = reader.result as string);
  reader.readAsDataURL(this.selectedImage);
}


openFacebook(): void {
  window.open('https://www.facebook.com/', '_blank');
}

}
