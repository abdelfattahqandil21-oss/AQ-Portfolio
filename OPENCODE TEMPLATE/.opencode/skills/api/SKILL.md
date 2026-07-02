---
name: api
description: Angular HTTP — provideHttpClient, interceptors, httpResource, typed errors
---

# API Integration

## Setup
```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

## httpResource (preferred)
```typescript
const products = httpResource<Product[]>(() => '/api/products');
// .value(), .isLoading(), .error(), .status()
```

## HttpClient Service
```typescript
@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  getAll(): Observable<Item[]> { return this.http.get<Item[]>('/api/items'); }
}
```

## Interceptors
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
```

## Rules
- No hardcoded URLs
- No `fetch()` — use HttpClient
- No subscribing in services — return Observable or use resource()
- Type all responses — no `any`
