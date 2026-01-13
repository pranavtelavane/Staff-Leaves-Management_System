import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Authservice {

  private API = `${environment.apiUrl}/users`;
  private USER_KEY = 'user';

  // 🔥 initialize EMPTY
  userSignal = signal<any | null>(null);

  constructor(private http: HttpClient) {
    // 🔥 hydrate AFTER service creation
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) {
      this.userSignal.set(JSON.parse(savedUser));
    }
  }

  // ---------------- API CALLS ----------------
  login(username: string, password: string) {
    return this.http.get<any[]>(
      `${this.API}?username=${username}&password=${password}`
    );
  }

  register(user: any) {
    return this.http.post(this.API, user);
  }

  // ---------------- AUTH STATE ----------------
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  getCurrentUser(): any | null {
    return this.userSignal();
  }

  isLoggedIn(): boolean {
    return !!this.userSignal();
  }

  // ---------------- ROLE HELPERS ----------------
  getRole(): 'HOD' | 'STAFF' | null {
    return this.userSignal()?.role || null;
  }

  isHod(): boolean {
    return this.getRole() === 'HOD';
  }

  isStaff(): boolean {
    return this.getRole() === 'STAFF';
  }

  // ---------------- LOGOUT ----------------
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSignal.set(null);
  }
}
