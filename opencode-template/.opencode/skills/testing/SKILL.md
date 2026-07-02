---
name: testing
description: Angular v22 testing — Angular Testing Library, signals, defer, httpResource
---

# Testing

Stack: Jest + @testing-library/angular

## What to Test
- Component renders given inputs
- Interactions trigger output/state
- Conditional `@if/@for` shows/hides correctly
- Error states display correctly

## Do NOT Test
- Private methods or internal signals
- That Angular's `@if` works
- Styles or CSS classes
- Trivial getters

## Component Testing
```typescript
await render(ButtonComponent, {
  inputs: { label: 'Save' },
  on: { clicked: jest.fn() },
});
```

## Testing Signal Inputs
```typescript
const count = signal(0);
await render(CounterComponent, {
  bindings: [inputBinding('count', count)],
});
count.set(5);
```

## Mocking Services
```typescript
const mock = { user: signal({ name: 'Ahmed' }) };
await render(ProfileComponent, {
  providers: [{ provide: AuthService, useValue: mock }],
});
```
