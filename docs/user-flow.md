These flows cover v1: add, edit and delete an expense, manage categories, read the monthly summary, and sign in. The steps are proposals to react to.

## Add an expense

1. Open the add form from the expense list.
2. Enter the amount in rupiah, as a whole number.
3. Pick the date; it defaults to today.
4. Pick a category.
5. Optionally add a note.
6. Save. The expense appears in the list and the month's totals update.

A missing amount, an amount of zero or less, or no category shows an inline error and blocks saving.

## Edit and delete an expense

**Edit**

1. Tap an expense in the list.
2. The form opens with its current values.
3. Change any field and save. The list and totals update.

**Delete**

1. From the open expense, choose Delete.
2. Confirm in a dialog.
3. The expense is removed and the totals update.

## Categories

Each expense has one category, chosen in the add and edit forms. The category list is managed on its own page:

1. A default set, including "Other", is seeded for each user.
2. Add a category by name.
3. Rename a category; its expenses keep it under the new name.
4. Delete a category. Deletion is blocked while expenses use it; reassign them first.

A category name is trimmed, with inner runs of spaces collapsed to one. A blank name, a name over 40 characters, or a name that matches another category ignoring case shows an inline error and blocks saving.

## Monthly summary

1. Open the dashboard; it shows the current month.
2. Switch months with previous and next.
3. Read the month's total and the per-category breakdown.
4. Tap a category to open the expense list filtered to that month and category.

## Sign in

1. First visit: create an account with email and password through Better Auth. Only the `OWNER_EMAIL` address can do this. Sign-up is closed once your account exists.
2. Later visits: sign in; the session keeps you signed in.
3. Any page opened without a session redirects to sign in.
4. Sign out from the menu.

## Decisions

- **Category:** required on every expense; an "Other" category is seeded.
- **Deleting a category:** blocked while expenses use it; reassign them first.
- **Deleting an expense:** permanent, after a confirm dialog. No undo in v1.
- **Sign-in:** email and password. A `databaseHooks.user.create.before` hook accepts only the `OWNER_EMAIL` address, and only while no account exists, so a stranger cannot claim a fresh deploy. To let others in, set `ALLOW_SIGN_UP=true` and redeploy; the sign-in page then links to a sign-up form (`/sign-in?mode=sign-up`).
- **Auth errors:** sign-in failures always show "Invalid email or password." Sign-up shows only errors that do not reveal whether an email is registered. Both forms go through Better Auth's HTTP router, so its rate limit applies (3 attempts per 10 seconds per IP).
