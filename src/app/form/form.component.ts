import { Component, AfterViewInit, ViewChild, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { DataTableComponent } from '../data-table/data-table.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements AfterViewInit, OnInit {
  private readonly MAX_VOLUME = 2000000;
  private _liveAnnouncer = inject(LiveAnnouncer);
  private Toast: any;
  options: FormGroup;
  volume: number = 0;
  Totalvolume: string = ''; // Volumen en cm³
  volumeInM3: number = 0; // Volumen en m³
  cost: number = 0;
  errorMessage: string = '';
  saveDisabled: boolean = false;


  items: Array<{ name:string, height: number, width: number, long: number, cost: number, volume: string, date: string }>=[];

  displayedColumns: string[] = ['name', 'height', 'width', 'long', 'cost', 'volume', 'date', 'actions'];

  dataSource = new MatTableDataSource(this.items);

  constructor(private fb: FormBuilder) {
    this.options = this.fb.group({
      name: [''],
      height: [0],
      width: [0],
      long: [0],
    });
    this.Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }


  ngOnInit() {
    this.options.valueChanges.subscribe(values => {
      this.calculateVolume(values.height, values.width, values.long);
    });
    const storedItems = localStorage.getItem('items');
    if (storedItems) {
      this.items = JSON.parse(storedItems);
      console.log(this.items, "FROM LOCALSTORAGE");
      this.dataSource.data = this.items;
    }
  }

  @ViewChild(MatSort) sort?: MatSort;

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  delete(element: any) {
    const index = this.items.indexOf(element);
    if (index >= 0) {
      this.items.splice(index, 1);

      this.dataSource.data = [...this.items];
      localStorage.setItem('items', JSON.stringify(this.items));
    }
  }

  calculateVolume(height: string, width: string, long: string) {
    const heightNum = parseFloat(height);
    const widthNum = parseFloat(width);
    const longNum = parseFloat(long);


    if (!isNaN(heightNum) && !isNaN(widthNum) && !isNaN(longNum)) {
      this.volume = heightNum * widthNum * longNum;


      this.volumeInM3 = this.volume / 1000000; // Convierte a m
      this.Totalvolume = this.volumeInM3.toFixed(6);

      if (this.volume > this.MAX_VOLUME) {
        this.swalMessage('error', 'El volumen excede el maximo!');
        this.errorMessage = 'El volumen excede el límite de 2 m³. Por favor, opere con un ejecutivo.';
        this.cost = 0;
        this.saveDisabled = true;

      } else {
        this.saveDisabled = false;
        this.errorMessage = '';
        let sum = heightNum + widthNum + longNum
        const volumeIn20cm3Units = Math.ceil(sum / 20);
        this.cost = volumeIn20cm3Units * 2000;
      }
    } else {
      this.volume = 0;
      this.cost = 0;
      this.errorMessage = '';
    }
  }

  save() {
    if (this.options.valid) {
      const { name, height, width, long } = this.options.value;

      if (height > 0 && width > 0 && long > 0) {
        this.items.push({
          name: name,
          height: height,
          width: width,
          long: long,
          cost: this.cost,
          volume: this.Totalvolume,
          date:  new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit' })
        });

        this.dataSource.data = [...this.items];
        localStorage.setItem('items', JSON.stringify(this.items));
        this.options.reset();
        this.swalMessage('success', 'Item agregado correctamente');

      } else {
        this.errorMessage = 'Información incompleta. Por favor, complete todos los campos.';
      }
    }
  }

  swalMessage(icon: 'success' | 'error', title: string) {
      this.Toast.fire({ icon, title });
  }

  validateNumber(event: any) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9.]/g, ''); // Permite números y puntos decimales
    this.options.get(input.getAttribute('formControlName'))?.setValue(input.value);
  }
}
