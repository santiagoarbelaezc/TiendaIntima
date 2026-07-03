import { HttpInterceptorFn } from '@angular/common/http';

export const mockAuthInterceptor: HttpInterceptorFn = (request, next) => next(request);