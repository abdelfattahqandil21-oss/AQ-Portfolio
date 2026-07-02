---
name: testing
description: Angular v22 testing with Angular Testing Library — signals, defer, resource
---

# Testing — Angular Testing Library + Jest

## What to Test
- Component renders correctly given inputs
- User interactions trigger output/state change
- Conditional rendering shows/hides correctly
- Error states display correctly

## Do NOT Test
- Implementation details (private methods, internal signal values)
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

## Testing Signals Inputs
```typescript
const count = signal(0);
await render(CounterComponent, {
  bindings: [inputBinding('count', count)],
});
count.set(5);
```

## Mocking Services
```typescript
const mockAuth = { user: signal({ name: 'Ahmed' }) };
await render(ProfileComponent, {
  providers: [{ provide: AuthService, useValue: mockAuth }],
});
```

## Testing @defer
```typescript
const { fixture } = await render(PageComponent, {
  deferBlockBehavior: DeferBlockBehavior.Manual,
});
for (const block of await fixture.getDeferBlocks()) {
  await block.render(DeferBlockState.Complete);
}
```

## Testing resource() / httpResource()
```typescript
// Mock the underlying HTTP call via provideHttpClientTesting
```
