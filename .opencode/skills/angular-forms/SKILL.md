---
name: angular-forms
description: Angular v22 Signal Forms — form(), FormField, FormRoot, validators, submission
---

# Signal Forms — @angular/forms/signals (Stable in v22)

Always use Signal Forms for new forms. Never Reactive Forms or Template-driven forms.

Import from `@angular/forms/signals`:
`form`, `FormField`, `FormRoot`, `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`, `validateTree`, `submit`, `disabled`, `hidden`, `readonly`, `applyEach`, `applyWhen`

## Model
```typescript
interface LoginData { userName: string; password: string; }
readonly loginModel = signal<LoginData>({ userName: '', password: '' });
```

## Form Creation
```typescript
readonly f = form(this.loginModel, (p) => {
  required(p.userName, { message: 'required' });
  pattern(p.userName, /^[a-zA-Z0-9_]+$/, { message: 'pattern' });
  required(p.password, { message: 'required' });
}, {
  submission: {
    action: async () => { /* runs only when valid */ },
    onInvalid: (field) => { /* runs when validation fails */ },
  },
});
```

## Template Bindings
```html
<form [formRoot]="f">
  <input [formField]="f.userName">
</form>
```

## Field State Signals
- `f.userName().value` — WritableSignal of the field value
- `f.userName().valid()` / `.invalid()` / `.errors()` / `.pending()`
- `f.userName().touched()` / `.dirty()`
- `f().submitting()` — loading during submission
- `f().reset(initialValue?)` — reset form state

## Validators
- `required(path, {message?, when?: fn})`
- `email(path, {message?})`
- `min(path, value, {message?})` / `max(path, value, {message?})`
- `minLength(path, length, {message?})` / `maxLength(path, length, {message?})`
- `pattern(path, regex, {message?})`
- `validate(path, ({value, valueOf}) => error | null)`
- `validateTree(path, (ctx) => error | null)` — cross-field
- `validateHttp(path, {request, onSuccess, onError})` — async HTTP
- `applyEach(arrayPath, itemSchema)` — array items
- `applyWhen(path, predicate, schemaFn)` — conditional
