# Codebase Audit Report

**Date:** December 2024
**Scope:** Full codebase review for improvements

## Executive Summary

This audit identifies 15 improvement areas across code quality, performance, accessibility, and security. The most critical issues involve code duplication, oversized components, and excessive prop drilling that impact maintainability.

---

## Critical Issues

### 1. Code Duplication in Shako.js

**Location:** `components/Shako.js` lines 920-997

**Issue:** `getTrackingUrl()` and `getCarrierName()` functions are completely re-implemented despite being imported from `utils/trackingUtils.js` at lines 32-33.

**Impact:** Any bug fixes must be made in two places; increased bundle size.

**Fix:** Remove the local implementations and use the imported functions.

---

### 2. Oversized Components

Several components violate the Single Responsibility Principle:

| File | Lines | Concern |
|------|-------|---------|
| `Shako.js` | 1965 | Main orchestration + filters + UI |
| `VehicleDetailModal.js` | 1776 | View + Edit + Service Events + Documents |
| `PartsTab.js` | 1525 | List + Filters + Pagination + Actions |
| `PartDetailModal.js` | 946 | View + Edit modes combined |

**Recommendation:** Split by responsibility:
- `VehicleDetailModal` → `VehicleViewMode`, `VehicleEditMode`, `VehicleServicePanel`
- `PartsTab` → `PartsList`, `PartsFilters`, `PartsPagination`

---

### 3. Excessive Prop Drilling

**Location:** `components/modals/VehicleDetailModal.js` lines 42-130

**Issue:** 89 props passed to a single component including separate state/setter pairs for every feature.

**Example props:**
```javascript
documents, loadingDocuments, uploadingDocument,
showAddDocumentModal, setShowAddDocumentModal,
serviceEvents, savingServiceEvent, ...
```

**Recommendation:**
- Use React Context for shared state (vehicles, projects, parts)
- Create feature-specific hooks that encapsulate state + handlers
- Consider Zustand for lightweight global state

---

## High Priority Issues

### 4. Browser Alerts for Error Handling

**Occurrences:** 20+ instances across hooks

**Affected Files:**
- `hooks/useParts.js` (lines 68, 111, 175, 208, 241, 287, 341, 372, 410)
- `hooks/useProjects.js` (line 87)
- `hooks/useVehicles.js` (multiple)
- `hooks/useServiceEvents.js` (multiple)

**Example:**
```javascript
alert('Error loading parts from database');
```

**Issues:**
- Blocks user interaction
- Not accessible for screen readers
- No error recovery options
- Not testable

**Fix:** Replace with the existing `Toast.js` component or implement a toast notification system.

---

### 5. Missing Input Validation

**Location:** `hooks/useParts.js` lines 120-122

```javascript
const price = parseFloat(newPart.price) || 0;
const shipping = parseFloat(newPart.shipping) || 0;
const duties = parseFloat(newPart.duties) || 0;
```

**Issues:**
- Malformed input like "abc" silently becomes 0
- No maximum value checks
- No negative number validation
- No user feedback

**Fix:** Add validation with user feedback:
```javascript
const price = parseFloat(newPart.price);
if (isNaN(price) || price < 0) {
  throw new Error('Invalid price value');
}
```

---

### 6. Accessibility Gaps

**Finding:** Only 2 `aria-label` instances in entire codebase (both in `Toast.js`).

**Missing Accessibility Features:**

| Issue | Location |
|-------|----------|
| No `aria-label` on icon buttons | `Shako.js` lines 1468-1480 |
| No `role="dialog"` on modals | All modal components |
| No `aria-modal="true"` | All modal components |
| No focus trap in modals | Focus can escape to background |
| No keyboard navigation | Dropdowns use click-only handlers |

**Example Fix:**
```jsx
<button
  onClick={handleAdd}
  aria-label="Add new part"
  className="p-2 rounded-lg"
>
  <Plus className="w-5 h-5" />
</button>
```

---

### 7. PriceDisplay Crash Vulnerability

**Location:** `components/ui/PriceDisplay.js`

```javascript
const formattedAmount = amount.toFixed(2); // Crashes on null/undefined
```

**Fix:**
```javascript
const formattedAmount = (amount ?? 0).toFixed(2);
```

---

## Medium Priority Issues

### 8. Inconsistent Error Handling Patterns

**Three different patterns in use:**
1. `alert()` calls (useParts.js, useVehicles.js)
2. Silent failures with comments (useDocuments.js line 78)
3. Comprehensive error handler (errorHandler.js - 226 lines, underutilized)

**Recommendation:** Standardize on `errorHandler.js` utilities across all hooks.

---

### 9. Missing Memoization

**Location:** `components/Shako.js`

**Unmemoized functions recreated every render:**
- `getStatusIcon()` (line 872)
- `getStatusText()` (line 884)
- `getStatusColor()` (line 896)
- `getStatusTextColor()` (line 907)
- Touch event handlers (lines 607-700)

**Fix:** Wrap with `useCallback`:
```javascript
const getStatusIcon = useCallback((part) => {
  // implementation
}, []);
```

---

### 10. Data Format Mapping Duplication

**Issue:** Database snake_case to app camelCase mapping repeated in every hook.

**Example from useParts.js:**
```javascript
// Repeated in useProjects.js, useVehicles.js, etc.
partNumber: part.part_number,
projectId: part.project_id,
createdAt: part.created_at,
```

**Fix:** Create shared mapping utilities:
```javascript
// utils/dataMappers.js
export const mapPartFromDb = (part) => ({
  ...part,
  partNumber: part.part_number,
  projectId: part.project_id,
  createdAt: part.created_at,
});
```

---

### 11. Filter Logic Complexity

**Location:** `components/Shako.js` lines 740-825

84 lines of filter/sort logic inside component. Should be extracted to `useFilters` hook or utility functions for testability and reuse.

---

## Low Priority / Long-term

### 12. No Type Safety

The project uses JavaScript without PropTypes validation.

**Recommendation:** Either:
- Add PropTypes for runtime validation
- Migrate to TypeScript (recommended for long-term)

### 13. List Performance

**Location:** `components/tabs/PartsTab.js`

Large lists use pagination but full re-render on page changes.

**Recommendation:** Consider virtual scrolling (react-window or @tanstack/react-virtual) for better performance with large datasets.

### 14. Security Considerations

- Client-side input sanitization is minimal
- Relies heavily on Supabase RLS for authorization
- Recommendation: Add server-side validation in Supabase Edge Functions for sensitive operations

---

## Action Plan

### Phase 1: Quick Wins (1-2 days)
- [ ] Remove duplicate tracking functions from Shako.js
- [ ] Add null-check to PriceDisplay component
- [ ] Replace critical `alert()` calls with toast notifications
- [ ] Add `aria-label` to icon-only buttons

### Phase 2: Error Handling (3-5 days)
- [ ] Create unified toast notification system
- [ ] Replace all `alert()` calls
- [ ] Standardize on errorHandler.js patterns
- [ ] Add input validation with user feedback

### Phase 3: Component Refactoring (1-2 weeks)
- [ ] Split VehicleDetailModal into focused components
- [ ] Extract PartsTab list/filter/pagination
- [ ] Create React Context for shared state
- [ ] Reduce prop drilling in modal chain

### Phase 4: Accessibility (1 week)
- [ ] Add ARIA attributes to all interactive elements
- [ ] Implement focus traps in modals
- [ ] Add keyboard navigation to dropdowns
- [ ] Test with screen reader

### Phase 5: Long-term Improvements
- [ ] Consider TypeScript migration
- [ ] Implement virtual scrolling
- [ ] Add comprehensive test coverage
- [ ] Set up error monitoring (Sentry)

---

## Files Requiring Most Attention

1. **`components/Shako.js`** - Remove duplication, memoize functions, extract logic
2. **`components/modals/VehicleDetailModal.js`** - Split into smaller components
3. **`hooks/useParts.js`** - Add validation, replace alerts
4. **`components/ui/PriceDisplay.js`** - Add null safety
5. **All modal components** - Add accessibility attributes
