---
name: angular-services
description: Angular v22 services — @Service(), inject(), signals, resource(), injectAsync()
---

# Angular Services — v22

## Declaring a Service
```typescript
// Singleton — use @Service() (replaces @Injectable({providedIn: 'root'}))
@Service()
export class AuthService { }

// Scoped — use bare @Injectable() + providers: [] on component
@Injectable()
export class FormStateService { }
```

## Consuming a Service
```typescript
export class MyComponent {
  private readonly auth = inject(AuthService);
}
```

## State Management
```typescript
@Service()
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce(...));

  add(item: CartItem): void {
    this._items.update(items => [...items, item]);
  }
}
```

## Async Data — resource() / httpResource()
```typescript
const data = httpResource<Response>(() => `/api/items`);
// data.value(), data.isLoading(), data.error(), data.status()
```

## Lazy Services — injectAsync()
```typescript
const exporter = injectAsync(() => import('./report-exporter').then(m => m.ReportExporter));
```

## Lifecycle
- `@Service()` services live for app lifetime — use `DestroyRef` for cleanup
- Bare `@Injectable()` services are scoped to the providing component's tree
