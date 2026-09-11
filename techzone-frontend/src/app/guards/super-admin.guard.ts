import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (user && user.role === 'ROLE_SUPER_ADMIN') {
    return true;
  }

  router.navigate(['/admin/dashboard']);
  return false;
};
