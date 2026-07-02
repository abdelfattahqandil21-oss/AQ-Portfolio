---
name: api-integration
description: Angular v22 HTTP — provideHttpClient, interceptors, httpResource(), typed errors
---

# API Integration

## HttpClient Setup
```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

## httpResource (preferred — stable in v22)
```typescript
const products = httpResource<Product[]>(() => '/api/products');
const product = httpResource<Product>(() => `/api/products/${id()}`);
// .value(), .isLoading(), .error(), .status()
```

## Typed API Service (when you need HttpClient directly)
```typescript
@Service()
export class ProductApiService {
  private readonly http = inject(HttpClient);
  getAll(): Observable<Product[]> { return this.http.get<Product[]>('/api/products'); }
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
- Never hardcode URLs
- Never subscribe in a service — return Observable or use resource()
- Never use `fetch()` directly — use HttpClient
- Type all API responses — no `any`
