import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const { data } = await authService.getSession();

  if (!data.session) {
    return true;
  }

  return router.createUrlTree(['/']);
};
