import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Authservice } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.scss',
})
export class LeaveManagement {
  leaveForm!: FormGroup;

  user: any;
  leaves: any[] = [];

  showApplyForm = false;

  selectedLeave: any = null;
  pendingAction: 'APPROVED' | 'REJECTED' | null = null;

  searchText = '';
  page = 1;
  pageSize = 5;
  totalPages = 0;

  filteredLeaves: any[] = [];
  pagedLeaves: any[] = [];

  constructor(
    private auth: Authservice,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.leaveForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', Validators.required],
    });
    this.loadLeaves();
  }

  loadLeaves(): void {
    let url = `${environment.apiUrl}/leaves`;

    if (this.user.role === 'STAFF') {
      url += `?userId=${this.user.id}`;
    }

    this.http.get<any[]>(url).subscribe((data) => {
      this.leaves =
        this.user.role === 'HOD' ? data.filter((l) => l.department === this.user.department) : data;

      this.applySearchAndPagination();
      this.cdr.detectChanges();
    });
  }

  applySearchAndPagination() {
    let temp = [...this.leaves];

    if (this.searchText.trim()) {
      const text = this.searchText.toLowerCase();
      temp = temp.filter(
        (l) => l.reason.toLowerCase().includes(text) || l.status.toLowerCase().includes(text)
      );
    }

    this.filteredLeaves = temp;

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.page = 1;
    this.updatePagedLeaves();
  }

  applyLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const { fromDate, toDate } = this.leaveForm.value;

    if (new Date(toDate) < new Date(fromDate)) {
      alert('To date cannot be before From date');
      return;
    }

    const payload = {
      ...this.leaveForm.value,
      userId: this.user.id,
      staffName: this.user.name,
      department: this.user.department,
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    this.http.post(`${environment.apiUrl}/leaves`, payload).subscribe(() => {
      alert('Leave applied successfully');
      this.showApplyForm = false;
      this.leaveForm.reset();
      this.loadLeaves();
    });
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePagedLeaves();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedLeaves();
    }
  }

  updatePagedLeaves() {
    const start = (this.page - 1) * this.pageSize;
    this.pagedLeaves = this.filteredLeaves.slice(start, start + this.pageSize);

    this.cdr.detectChanges();
  }

  // HOD: Approve / Reject
  updateStatus(leave: any, status: 'APPROVED' | 'REJECTED') {
    this.http.patch(`${environment.apiUrl}/leaves/${leave.id}`, { status }).subscribe(() => {
      this.loadLeaves();
    });
  }

  viewLeave(leave: any) {
    this.selectedLeave = leave;
  }

  openConfirmModal(leave: any, action: 'APPROVED' | 'REJECTED') {
    this.selectedLeave = leave;
    this.pendingAction = action;
  }

  confirmAction() {
    if (!this.selectedLeave || !this.pendingAction) return;

    this.http
      .patch(`${environment.apiUrl}/leaves/${this.selectedLeave.id}`, {
        status: this.pendingAction,
      })
      .subscribe(() => {
        this.selectedLeave = null;
        this.pendingAction = null;
        this.loadLeaves();
      });
  }
}
