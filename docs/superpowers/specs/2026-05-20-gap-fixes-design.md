# Design: Gap Fixes — Filters, Password Change, Table Layout

Date: 2026-05-20

## Context

Three gaps were identified during a requirements review against `info.md`:

1. Role/status filters on the users page are client-side only — incorrect when results span multiple pages.
2. Self-service password change in ProfilePage is not implemented (fields are disabled).
3. The users list is a card grid; the spec requires a "tabla de usuarios."

---

## Gap 1 — Server-side role/status filters

### Backend changes

`GET /api/users` accepts two new optional query params:

- `role` — `string?` (`"admin"` | `"user"` | omit for all)
- `isActive` — `bool?` (`true` | `false` | omit for all)

**`IUserRepository` interface** — `GetPagedAsync` signature becomes:

```csharp
Task<(IEnumerable<User>, int)> GetPagedAsync(
    string? search, string? role, bool? isActive, int page, int size);
```

**`UserRepository.GetPagedAsync`** — extend the EF Core query:

```csharp
.Where(u => role == null || u.Role == role)
.Where(u => isActive == null || u.IsActive == isActive)
```

**`IUserService` + `UserService`** — thread the two new params through `GetAllAsync`.

**`UsersController.GetAll`** — add `[FromQuery] string? role` and `[FromQuery] bool? isActive`.

### Frontend changes

`UsersPage` passes `role` and `isActive` as Axios query params (when not "all") alongside `search`, `page`, and `size`. The client-side `visibleItems` filter is removed — the API result is rendered directly.

```ts
params: {
  search,
  page,
  size: PAGE_SIZE,
  ...(roleFilter !== 'all' && { role: roleFilter }),
  ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
}
```

The `useEffect` that resets `page` to 1 on filter/search change stays as-is.

---

## Gap 2 — Self-service password change

### Backend changes

**`UpdateUserDto`** — add two optional fields:

```csharp
public string? CurrentPassword { get; set; }
public string? NewPassword { get; set; }
```

The existing `Password` field (admin-only reset) is renamed to `NewPassword` for clarity. Admin path: `CurrentPassword` is ignored, `NewPassword` applied directly. User path: if `NewPassword` is provided, `CurrentPassword` must also be provided and verified against the stored hash; if verification fails, throw `UnauthorizedException("Incorrect current password.")`.

**`UserService.UpdateAsync`** logic:

```
if requesterRole == "admin":
    if dto.NewPassword != null → hash and set
else:
    if dto.NewPassword != null:
        if dto.CurrentPassword == null → 400 / bad request
        if !passwordService.Verify(dto.CurrentPassword, user.PasswordHash) → 401
        hash dto.NewPassword and set
```

### Frontend changes

**`ProfilePage`** — the Security section becomes a functional form with three fields:
- Current password (required when submitting new password)
- New password (min 8 chars)
- Confirm new password (must match)

On submit, `PUT /api/users/{id}` is called with `{ name: currentName, currentPassword, newPassword }`. Success clears the form and shows a success alert. Error shows the server message.

**`UserFormPage`** — the `password` field in the admin create/edit form is renamed in the DTO payload to `newPassword` to align with the updated contract.

---

## Gap 3 — Table layout with Avatar

### UsersPage refactor

The card grid (`div.users-grid`) is replaced with a `<table>`. Avatar is preserved in the Name column.

**Columns:**

| # | Header | Content |
|---|---|---|
| 1 | (checkbox) | `<Checkbox>` for bulk selection |
| 2 | Usuario | `<Avatar>` + name + email (stacked) |
| 3 | Rol | `<Pill>` |
| 4 | Estado | `<Pill dot>` |
| 5 | Acciones | Edit icon button + delete icon button |

**Skeleton rows** — replace `SkeletonCard` with `SkeletonRow`: a `<tr>` with shimmer `<td>` cells matching the column widths.

**Styling** — use existing CSS variables (`--border`, `--r-2`, `--text-muted`, etc.). `<th>` uses `eyebrow` style. Rows get a subtle hover state (`--bg-hover`). No new CSS classes unless unavoidable.

**Responsive** — on screens `< 640px`, the Role and Status columns are hidden (`display: none` via a media query); the table remains scrollable horizontally if needed.

---

## Error handling

- Backend filter params are optional and ignored if omitted — no validation needed beyond the existing model binding.
- Wrong `CurrentPassword` → 401 with message "Incorrect current password." displayed in the ProfilePage alert.
- Confirm-password mismatch is validated client-side only (no round-trip needed).

## Testing

- `UserServiceTests` — add cases: user changes own password with correct current password (succeeds); with wrong current password (throws UnauthorizedException); admin changes password without CurrentPassword (succeeds).
- `UserRepositoryTests` (or inline in integration) — verify `GetPagedAsync` filters by role and isActive correctly.
- No new frontend tests required beyond what already exists.

---

## Out of scope

- Bulk delete action (the bulk-select bar stays but remains non-functional for delete).
- "View" detail page (read-only user detail route `/users/:id`).
- Avatar upload.
