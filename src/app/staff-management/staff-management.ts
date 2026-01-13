import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Authservice } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './staff-management.html',
})
export class StaffManagement implements OnInit {
  addStaffForm!: FormGroup;

  staffList: any[] = [];
  pagedStaff: any[] = [];

  page = 1;
  pageSize = 10;
  totalPages = 0;

  hod: any = null;

  searchText = '';

  sortColumn: 'name' | 'username' | 'email' | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedStaff: any = null;

  profilePreview: string | null = null;

  constructor(
    private auth: Authservice,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.hod = this.auth.getCurrentUser();
    this.addStaffForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      password: ['', Validators.required],
      profilePhoto: [''],
    });

    if (!this.hod) return;

    this.loadStaff();
  }

  loadStaff(): void {
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe((users) => {
      this.staffList = users.filter(
        (u) => u.role === 'STAFF' && u.department === this.hod.department
      );

      this.applySearchAndSort();

      this.cdr.detectChanges();
    });
  }

  applySearchAndSort(): void {
    let filtered = [...this.staffList];

    // SEARCH
    if (this.searchText.trim()) {
      const text = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(text) ||
          s.username.toLowerCase().includes(text) ||
          s.email.toLowerCase().includes(text) ||
          s.mobile.includes(text)
      );
    }

    // SORT
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valA = a[this.sortColumn].toLowerCase();
        const valB = b[this.sortColumn].toLowerCase();

        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.page = 1;
    this.pagedStaff = filtered.slice(0, this.pageSize);
  }

  sort(column: 'name' | 'username' | 'email') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySearchAndSort();
    this.cdr.detectChanges();
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePagedData();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedData();
    }
  }

  updatePagedData() {
    const start = (this.page - 1) * this.pageSize;
    this.pagedStaff = this.staffList.slice(start, start + this.pageSize);

    this.cdr.detectChanges();
  }

  viewStaff(staff: any): void {
    this.selectedStaff = staff;
  }

  deleteStaff(id: string): void {
    if (!confirm('Are you sure you want to delete this staff?')) return;

    this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe(() => {
      this.loadStaff();
    });
  }

  openAddStaffModal(): void {
  this.addStaffForm.reset();
  this.profilePreview = null;
}

onPhotoSelect(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.profilePreview = reader.result as string;
    this.addStaffForm.patchValue({
      profilePhoto: reader.result
    });
  };
  reader.readAsDataURL(file);
}

submitAddStaff(): void {
  if (this.addStaffForm.invalid) {
    this.addStaffForm.markAllAsTouched();
    return;
  }

  const payload = {
    ...this.addStaffForm.value,
    role: 'STAFF',
    department: this.hod.department
  };

  this.http.post(`${environment.apiUrl}/users`, payload).subscribe(() => {
    alert('Staff added successfully');
    this.loadStaff(); // refresh list
  });
}

}
