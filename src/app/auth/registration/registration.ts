import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  registerForm!: FormGroup;
  profilePreview!: string;
  showDetailsForm: boolean = false;

  constructor(private fb: FormBuilder, private authService: Authservice, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      department: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$'),
        ],
      ],
      role: ['', Validators.required],
      profilePhoto: [''],
    });
  }

  continue() {
    const roleControl = this.registerForm.get('role');

    if (roleControl?.invalid) {
      roleControl.markAsTouched();
      return;
    }

    this.showDetailsForm = true;
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Your account has been created successfully.',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#198754',
        allowOutsideClick: false,
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
    });
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePreview = reader.result as string;
      this.registerForm.patchValue({
        profilePhoto: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }
}
