# Christmas Name Draw 🎄

A simple Christmas-themed Secret Santa app. Add names, draw a unique gift-giving recipient for everyone, and reveal the pairings one at a time.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`.

## How it works

- Start with four rows; first names are required and last names are optional.
- Use **Add another name** for additional participants.
- At least two participants are required. Duplicate full names (ignoring capitalization) are rejected.
- Each person is assigned to exactly one other person, never themselves.
- **Re-Draw** makes a new assignment with the same names; **Re-Start** clears the form.

Names and pairings are only kept in app memory and are not sent to a server.
