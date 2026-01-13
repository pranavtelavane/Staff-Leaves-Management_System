import { HttpClient } from '@angular/common/http';
import { Component, signal, effect } from '@angular/core';
import { Authservice } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  staffCount = signal(0);
  totalLeaves = signal(0);
  approvedLeaves = signal(0);
  rejectedLeaves = signal(0);
  user = signal<any | null>(null);

  constructor(private http: HttpClient, private auth: Authservice) {
    effect(() => {
      const currentUser = this.auth.userSignal();

      if (!currentUser) {
        this.reset();
        return;
      }

      this.user.set(currentUser);

      if (currentUser.role === 'HOD') {
        this.loadHodDashboard(currentUser);
      }

      if (currentUser.role === 'STAFF') {
        this.loadStaffDashboard(currentUser);
      }
    });
  }

  private reset() {
    this.staffCount.set(0);
    this.totalLeaves.set(0);
    this.approvedLeaves.set(0);
    this.rejectedLeaves.set(0);
  }

  private loadHodDashboard(user: any) {
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe((users) => {
      const count = users.filter(
        (u) => u.role === 'STAFF' && u.department === user.department
      ).length;

      this.staffCount.set(count); //signal update
    });
  }

  private loadStaffDashboard(user: any) {
    this.http.get<any[]>(`${environment.apiUrl}/leaves?userId=${user.id}`).subscribe((leaves) => {
      this.totalLeaves.set(leaves.length);
      this.approvedLeaves.set(leaves.filter((l) => l.status === 'APPROVED').length);
      this.rejectedLeaves.set(leaves.filter((l) => l.status === 'REJECTED').length);
    });
  }
}
