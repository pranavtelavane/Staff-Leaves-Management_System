import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const hodGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (user?.role === 'HOD') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
