# دليل Angular 22 الشامل للمطور

> مرجع جاهز للإنتاج لبناء تطبيقات Angular حديثة.

---

## 1. المبادئ الأساسية

```ts
// ❌ غلط - مش مطلوب
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OldComponent {}

// ✅ صح - standalone و OnPush افتراضيين في v22
@Component({
  selector: 'app-modern',
  template: `<p>مرحباً</p>`,
})
export class ModernComponent {}

// ✅ Zoneless هو الافتراضي - مش محتاج add أي provider
// Zoneless مفعل افتراضيًا من Angular v21+
// فقط أضف provideZonelessChangeDetection() لو مستهدف v20
export const appConfig: ApplicationConfig = {
  providers: [],
};
```

### القواعد الأساسية
| القاعدة | ✅ الصح | ❌ الغلط |
|---------|---------|----------|
| Standalone | لا تكتب `standalone: true` | تكتبه يدويًا |
| Change Detection | لا تكتب — OnPush افتراضي | تكتب `OnPush` يدويًا |
| Host bindings | `host: { class: 'foo' }` | `@HostBinding` / `@HostListener` |
| Input/Output | دوال `input()` و `output()` | مزخرفات `@Input()` و `@Output()` |
| حقن التبعيات | دالة `inject()` | الحقن عبر constructor |
| الصور الثابتة | directive `NgOptimizedImage` | وسم `<img>` عادي |
| ngClass / ngStyle | روابط `[class]` / `[style]` | `ngClass` / `ngStyle` |
| التحكم بالتدفق | `@if` `@for` `@switch` | `*ngIf` `*ngFor` `*ngSwitch` |
| تغيير الـ signals | `.set()` / `.update()` | `.mutate()` |

---

## 2. مُزَخرِف @Service()

يستبدل `@Injectable({providedIn: 'root'})` للخدمات الفردية.

```ts
import { Service } from '@angular/core';

@Service()
export class DataStore {
  private items = signal<string[]>([]);

  readonly itemsCount = computed(() => this.items().length);

  add(item: string) {
    this.items.update(list => [...list, item]);
  }
}
```

استخدم `@Injectable()` فقط عندما تحتاج:
- مزود غير جذري (`providedIn: 'platform'`, `providedIn: 'any'`)
- حقن عبر constructor (نادرًا)
- تهيئة InjectionToken

---

## 3. نماذج الإشارات (Signal Forms)

### 3.1 التجهيز
```ts
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required, email, minLength, pattern } from '@angular/forms/signals';
```

### 3.2 نموذج بسيط

```ts
interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="f">
      <input [formField]="f.email" type="email" placeholder="البريد" />

      @if (f.email().touched() && f.email().invalid()) {
        @for (err of f.email().errors(); track err.kind) {
          <p>{{ err.message }}</p>
        }
      }

      <input [formField]="f.password" type="password" placeholder="كلمة المرور" />

      @if (f.password().touched() && f.password().invalid()) {
        @for (err of f.password().errors(); track err.kind) {
          <p>{{ err.message }}</p>
        }
      }

      <button type="submit" [disabled]="f().submitting()">
        @if (f().submitting()) { جاري التحميل... } @else { دخول }
      </button>
    </form>
  `,
})
export class LoginForm {
  readonly model = signal<LoginData>({ email: '', password: '' });

  readonly f = form(this.model, (p) => {
    required(p.email, { message: 'البريد مطلوب' });
    email(p.email, { message: 'أدخل بريدًا صحيحًا' });
    required(p.password, { message: 'كلمة المرور مطلوبة' });
    minLength(p.password, 8, { message: '8 أحرف كحد أدنى' });
  });
}
```

### 3.3 إرسال النموذج

```ts
readonly f = form(this.model, (p) => {
  required(p.email);
  required(p.password);
}, {
  submission: {
    action: async () => {
      await this.authService.login(this.model());
    },
    onInvalid: (field) => {
      const first = field().errorSummary()[0];
      first?.fieldTree().focusBoundControl();
    },
    ignoreValidators: 'pending',
  },
});
```

### 3.4 حالات الحقل

| الإشارة | الشرح |
|---------|-------|
| `f.email().value` | إشارة قابلة للكتابة لقيمة الحقل |
| `f.email().valid()` | لا توجد أخطاء تحقق |
| `f.email().invalid()` | يوجد أخطاء تحقق |
| `f.email().errors()` | مصفوفة أخطاء `{kind, message}` |
| `f.email().pending()` | تحقق غير متزامن قيد التنفيذ |
| `f.email().touched()` | الحقل تم التركيز عليه ثم الخروج منه |
| `f.email().dirty()` | المستخدم عدّل الحقل |
| `f.email().disabled()` | الحقل معطل |
| `f.email().hidden()` | الحقل مخفي |
| `f.email().readonly()` | الحقل للقراءة فقط |
| `f().submitting()` | النموذج قيد الإرسال |
| `f().errorSummary()` | كل الأخطاء لإدارة التركيز |
| `f().valid()` / `f().invalid()` | صحة النموذج ككل |

### 3.5 جميع أدوات التحقق

```ts
import {
  required, email, min, max, minLength, maxLength, pattern,
  validate, validateTree, validateHttp,
  applyEach, applyWhen, applyWhenValue,
  disabled, hidden, readonly,
} from '@angular/forms/signals';

// --- أدوات مدمجة ---
required(p.name, { message: 'مطلوب' });
email(p.email, { message: 'بريد غير صحيح' });
min(p.age, 18, { message: 'يجب أن تكون 18+' });
max(p.age, 120, { message: 'عمر غير صحيح' });
minLength(p.password, 8, { message: 'قصير جدًا' });
maxLength(p.bio, 500, { message: 'طويل جدًا' });
pattern(p.phone, /^\d{10}$/, { message: 'مطلوب 10 أرقام' });

// --- مطلوب شرطيًا ---
required(p.promoCode, {
  message: 'مطلوب',
  when: ({ valueOf }) => valueOf(p.applyDiscount),
});

// --- أداة تحقق مخصصة ---
validate(p.username, ({ value, valueOf }) => {
  if (value().length < 3) {
    return { kind: 'tooShort', message: '3 أحرف كحد أدنى' };
  }
  return null;
});

// --- تحقق عبر الحقول ---
validate(p.confirmPassword, ({ value, valueOf }) => {
  if (value() !== valueOf(p.password)) {
    return { kind: 'mismatch', message: 'كلمة المرور غير متطابقة' };
  }
  return null;
});

// --- تحقق غير متزامن عبر HTTP ---
validateHttp(p.username, {
  request: ({ value }) => `/api/check?username=${value()}`,
  onSuccess: (res: any) => res.taken
    ? { kind: 'taken', message: 'اسم المستخدم محجوز' }
    : null,
  onError: () => ({ kind: 'network', message: 'تعذر التحقق' }),
});

// --- تحقق عناصر المصفوفة ---
function ItemSchema(item: SchemaPathTree<Item>) {
  required(item.name, { message: 'مطلوب' });
  min(item.quantity, 1, { message: '1 كحد أدنى' });
}
applyEach(p.items, ItemSchema);

// --- التوفر والإتاحة ---
disabled(p.couponCode, { when: ({ valueOf }) => valueOf(p.total) < 50 });
hidden(p.shippingAddress, { when: ({ valueOf }) => !valueOf(p.requiresShipping) });
readonly(p.username);
```

### 3.6 التحكم البرمجي

```ts
// استبدال النموذج بالكامل
this.model.set({ email: '', password: '' });

// تحديث حقل فردي
this.f.email().value.set('new@email.com');

// إعادة تعيين النموذج
f().reset({ email: '', password: '' });

// إرسال يدوي
import { submit } from '@angular/forms/signals';
await submit(this.f, { action: async () => { /* ... */ } });
```

---

## 4. Angular Aria

```bash
pnpm add @angular/aria
```

### الأنماط المتاحة
| مسار الاستيراد | التوجيهات |
|----------------|------------|
| `@angular/aria/accordion` | `Accordion`, `AccordionPanel` |
| `@angular/aria/autocomplete` | `Autocomplete` |
| `@angular/aria/combobox` | `Combobox` |
| `@angular/aria/grid` | `Grid`, `GridColumn`, `GridRow`, `GridCell` |
| `@angular/aria/listbox` | `Listbox`, `ListboxOption` |
| `@angular/aria/menu` | `Menu`, `MenuItem` |
| `@angular/aria/menubar` | `Menubar`, `MenubarItem` |
| `@angular/aria/multiselect` | `Multiselect` |
| `@angular/aria/select` | `Select` |
| `@angular/aria/tabs` | `Tabs`, `TabPanel` |
| `@angular/aria/toolbar` | `Toolbar`, `ToolbarWidget`, `ToolbarWidgetGroup` |
| `@angular/aria/tree` | `Tree`, `TreeItem` |

### مثال شريط أدوات

```ts
import { Component } from '@angular/core';
import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';

@Component({
  selector: 'app-editor-toolbar',
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup],
  template: `
    <div ngToolbar aria-label="شريط التنسيق">
      <div ngToolbarWidgetGroup role="radiogroup" aria-label="المحاذاة">
        <button ngToolbarWidget role="radio" value="left" #left="ngToolbarWidget"
          [aria-checked]="left.selected()">L</button>
        <button ngToolbarWidget role="radio" value="center" #center="ngToolbarWidget"
          [aria-checked]="center.selected()">C</button>
      </div>

      <button ngToolbarWidget value="bold" #bold="ngToolbarWidget"
        [aria-pressed]="bold.selected()">B</button>
    </div>
  `,
})
export class EditorToolbar {}
```

Angular Aria يتولى: التنقل بلوحة المفاتيح (أسهم, Tab, Enter, Escape), سمات ARIA, إدارة التركيز, إعلانات قارئ الشاشة, ودعم RTL.

---

## 5. `resource()` و `httpResource()`

### 5.1 استخدام أساسي

```ts
import { resource } from '@angular/core';
import { httpResource } from '@angular/common/http';

// عملية غير متزامنة عامة
const user = resource({
  params: () => ({ id: userId() }),
  loader: ({ params, abortSignal }) =>
    fetch(`/api/users/${params.id}`, { signal: abortSignal }),
});

// HTTP عبر HttpClient (يشمل interceptors)
const weather = httpResource<Weather>(() =>
  `/api/weather?city=${selectedCity()}`
);

// مع POST body
const result = httpResource<Response>(() => ({
  url: '/api/data',
  method: 'POST',
  body: { query: searchTerm() },
}));
```

### 5.2 حالات المورد

```ts
const r = httpResource<Data>(() => '/api/data');

r.value();        // Data | undefined
r.hasValue();     // boolean — يعمل أيضًا كـ type guard
r.error();        // unknown | undefined
r.isLoading();    // boolean
r.status();       // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
r.reload();       // إعادة تشغيل التحميل
r.set(value);     // تعيين قيمة محليًا
r.update(fn);     // تحديث محلي
r.snapshot;       // Signal<ResourceSnapshot<Data>>

// الاستخدام في القالب
@if (r.isLoading()) {
  <p>جاري التحميل...</p>
} @else if (r.hasValue()) {
  <p>{{ r.value().name }}</p>
} @else if (r.error(); let err) {
  <p>خطأ: {{ err }}</p>
}
```

### 5.3 تخزين مؤقت لـ SSR

```ts
const data = httpResource<Data>(() => '/api/data', {
  id: 'unique-cache-key', // يخزن في TransferState لـ SSR
});
```

### 5.4 تسلسل المصادر

```ts
const user = httpResource<User>(() => `/api/users/${userId()}`);

const company = resource({
  params: ({ chain }) => chain(user)?.companyId,
  loader: ({ params }) => fetchCompany(params!),
});
```

---

## 6. `injectAsync()` — التحميل البطيء للخدمات

```ts
import { Component, injectAsync, onIdle } from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">تصدير</button>`,
})
export class ReportComponent {
  private exporter = injectAsync(
    () => import('./report-exporter').then(m => m.ReportExporter),
  );

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

### استراتيجيات التحميل المسبق

```ts
// عند خمول المتصفح
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: onIdle,
});

// مع مهلة زمنية
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: () => onIdle({ timeout: 1_000 }),
});

// مشغل مخصص (مثلاً عند التمرير)
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: () => new Promise(resolve => {
    element.addEventListener('pointerenter', () => resolve(), { once: true });
  }),
});
```

> **متطلب:** يجب أن تكون الخدمة المحملة بطيئًا مزودة تلقائيًا بـ `@Service()` أو `@Injectable({providedIn: 'root'})`.

---

## 7. تحسينات القوالب

### 7.1 التعليقات في العناصر

```html
<div
  // تعليق في السطر
  /* تعليق في كتلة */
  class="foo"
  /* تعليق
     متعدد
     الأسطر */
  id="bar">
</div>
```

### 7.2 صيغة الانتشار (Spread)

```html
<!-- نشر كائن -->
<div [class]="{ ...baseClasses, 'is-active': isActive() }"></div>

<!-- نشر مصفوفة -->
<app-list [items]="[...defaultItems, 'custom']" />

<!-- نشر في دالة -->
<p>المجموع: ${{ calculate(...prices, tax) }}</p>
```

### 7.3 @switch حالات متعددة والفحص الشامل

```html
@switch (status()) {
  @case ('pending')
  @case ('processing') {
    <p class="badge-blue">قيد التنفيذ</p>
  }
  @case ('completed') {
    <p class="badge-green">تم</p>
  }
  @default never;
}
```

### 7.4 دوال الأسهم في القوالب

```html
<button (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
  إنقاص
</button>

<p>المجموع: {{ items().reduce((sum, i) => sum + i.price, 0) }}</p>
```

### 7.5 @boundary — حدود الأخطاء (معاينة مطور)

```html
@boundary {
  <app-checkout-form />
}
@error (let err) {
  <app-error-fallback [error]="err" />
}
```

---

## 8. تحديثات الموجه (Router)

```ts
import { provideRouter, withExperimentalPlatformNavigation, withExperimentalAutoCleanupInjectors } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withExperimentalPlatformNavigation(), // واجهة Navigation الأصلية
      withExperimentalAutoCleanupInjectors(), // تدمير Injectors غير المستخدمة
    ),
  ],
};

// تنظيف مقابض المسارات المخزنة
import { destroyDetachedRouteHandle } from '@angular/router';
// الاستخدام داخل RouteReuseStrategy مخصص
```

---

## 9. كشف التغيير والأداء

```ts
// ✅ صح: OnPush افتراضي، لا داعي لتحديده
@Component({
  selector: 'app-fast',
  template: `...`,
})
export class FastComponent {}

// فقط إذا كنت تحتاج الكشف القديم:
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-legacy',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.Eager, // أعيدت تسميته من Default
})
export class LegacyComponent {}

// Zoneless افتراضي — لا حاجة لإعداد
```

### قائمة مراجعة الأداء
- استخدم signals + OnPush (افتراضي) للتحديثات الدقيقة
- استخدم `NgOptimizedImage` للصور
- استخدم `@defer` للمكونات الثقيلة
- استخدم `injectAsync()` للخدمات الثقيلة
- استخدم `httpResource()` لجلب البيانات مع حالات التحميل والأخطاء المدمجة
- طبق التحميل البطيء لكل مسارات الميزات

---

## 10. الوصولية (WCAG AA)

### قواعد عامة
- كل العناصر التفاعلية يجب أن يكون لها أسماء يمكن الوصول إليها
- استخدم HTML الدلالي (`<button>`, `<nav>`, `<header>`) بدلاً من ARIA كلما أمكن
- أدِر التركيز عند التنقل وأخطاء النماذج
- تأكد من تباين الألوان وفقًا لمعايير WCAG AA
- ادعم التنقل بلوحة المفاتيح لجميع العناصر التفاعلية
- ادعم التخطيطات RTL

### استخدام Angular Aria
للأنماط التفاعلية المعقدة (القوائم، التبويبات، الأشجار، إلخ)، استخدم توجيهات Angular Aria من `@angular/aria` التي تتولى:
- التنقل بلوحة المفاتيح
- إدارة سمات ARIA
- إدارة التركيز
- إعلانات قارئ الشاشة
- دعم RTL

### تحسين الصور

```html
<!-- ✅ صح: NgOptimizedImage -->
<img ngSrc="photo.jpg" width="800" height="600" alt="وصف" priority />

<!-- ✅ صح: الصور البعيدة تحتاج loader أو priority -->
<img ngSrc="https://example.com/photo.jpg" width="800" height="600" alt="وصف"
  priority />
```

---

## مرجع سريع: استيرادات الحزم

| الميزة | مسار الاستيراد |
|--------|----------------|
| `@Service()` | `@angular/core` |
| `injectAsync()` | `@angular/core` |
| `resource()` | `@angular/core` |
| `httpResource()` | `@angular/common/http` |
| `form()`، `FormField`، `FormRoot` | `@angular/forms/signals` |
| `required`، `email`، `pattern`، إلخ | `@angular/forms/signals` |
| `submit()` | `@angular/forms/signals` |
| توجيهات Angular Aria | `@angular/aria/<pattern>` (مثلاً `@angular/aria/toolbar`) |
| `withViewTransitions()` | `@angular/router` |
| `withExperimentalPlatformNavigation()` | `@angular/router` |
| `provideZonelessChangeDetection()` (فقط لو مستهدف v20) | `@angular/core` |

---

## قائمة مراجعة الترحيل (v21 ← v22)

- [ ] إزالة `standalone: true` الصريح
- [ ] إزالة `ChangeDetectionStrategy.OnPush` الصريح
- [ ] إزالة `provideZonelessChangeDetection()` إن كان موجودًا (هو افتراضي في v21+)
- [ ] ترحيل النماذج إلى Signal Forms (`@angular/forms/signals`)
- [ ] استبدال `@Injectable({providedIn: 'root'})` بـ `@Service()`
- [ ] إضافة `withViewTransitions()` إلى الموجه
- [ ] تحديث `ngClass`/`ngStyle` ← `[class]`/`[style]`
- [ ] استبدال `*ngIf`/`*ngFor` ← `@if`/`@for`
- [ ] تحديث `@HostBinding`/`@HostListener` ← `host: {}`
- [ ] تحديث `@Input()`/`@Output()` ← `input()`/`output()`
- [ ] مراجعة الصور لاستخدام `NgOptimizedImage`
