import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatCardModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);

  items: Array<{ name:string, height: number, width: number, long: number, cost: number }>=[];

  displayedColumns: string[] = ['name', 'height', 'width', 'long', 'cost'];

  dataSource = new MatTableDataSource(this.items);

  @ViewChild(MatSort) sort?: MatSort;

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  ngOnInit() {
    const storedItems = localStorage.getItem('items');
    if (storedItems) {
      this.items = JSON.parse(storedItems);
      console.log(this.items, "FROM LOCALSTORAGE");
      this.dataSource.data = this.items;
    }
  }
}
