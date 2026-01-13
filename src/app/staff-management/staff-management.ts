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
import Swal from 'sweetalert2';

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

  defaultAvatar = 'avatar.svg';

  constructor(
    private auth: Authservice,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.hod = this.auth.getCurrentUser();
    this.addStaffForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$'),
        ],
      ],
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'This staff member will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // danger
      cancelButtonColor: '#6c757d', // secondary
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Staff member has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false,
            });

            this.loadStaff();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Unable to delete staff. Please try again.',
            });
          },
        });
      }
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
        profilePhoto: reader.result,
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
      department: this.hod.department,
    };

    this.http.post(`${environment.apiUrl}/users`, payload).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Staff Added',
        text: 'New staff member added successfully.',
        confirmButtonColor: '#198754',
        timer: 2000,
        showConfirmButton: false,
      });
      this.addStaffForm.reset();
      this.profilePreview = null;
      this.loadStaff();
    });
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }
}
