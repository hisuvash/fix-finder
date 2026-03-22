# MongoDB — Reviews, connections & search (what you need to know)

You **do not** need to manually create collections in Atlas. When the app connects with Mongoose, it will create:

| Collection | Purpose |
|------------|---------|
| `reviews` | Each document is one review (who reviewed whom, stars, text). |
| `connectionrequests` | Client → handyman connection requests (`pending` / `accepted` / `rejected`). **Reviews require `accepted`.** |

## Fields on existing `users` collection

Mongoose will accept these on user documents (existing users work without them until set):

| Field | Type | Who | Purpose |
|-------|------|-----|---------|
| `workedWithHandymen` | Array of ObjectIds (User) | **Normal** users | Handymen this client has worked with → allows **client → handyman** reviews. |
| `workedWithClients` | Array of ObjectIds (User) | **Handyman** users | Filled when a connection request is **accepted** (or via seed). |
| `skills` | Array of strings | **Handyman** (optional) | Used for **Search** (skill filter). |

**How links get set**

- Normal user sends **`POST /api/connections/request`** → handyman sees it under **Requests** → **`POST /api/connections/:id/accept`** → both `workedWithHandymen` / `workedWithClients` update and a `ConnectionRequest` is `accepted`.
- Running `node scripts/seed-past-handymen.js` still updates user arrays **and** creates **accepted** `ConnectionRequest` rows (needed for reviews).

**API (high level)**

- `GET /api/users/search/handymen` — **Normal** users only; query: `city`, `stateProvince`, `country`, `skill`.
- `GET /api/users/past-handymen` / `GET /api/users/past-clients` — profile tiles.
- `POST /api/connections/request`, `GET /api/connections/sent`, `GET /api/connections/incoming`, `POST .../accept`, `POST .../reject`.

## `reviews` document shape

```js
{
  reviewerId: ObjectId,  // who wrote the review
  revieweeId: ObjectId,  // who is being reviewed
  rating: Number,        // 1–5
  comment: String,       // optional, max 2000 chars
  createdAt: Date,
  updatedAt: Date
}
```

**Unique rule:** At most **one** review per pair `(reviewerId, revieweeId)` (enforced by a unique index).

## Atlas / credentials

Keep using your existing **`MONGO_URI`** in `backend/.env`. No new env vars are required for reviews.

If you ever need to **inspect data** in Atlas:

- **reviews** — filter by `revieweeId` to see all reviews about someone.
- **users** — check `workedWithHandymen` / `workedWithClients` if someone cannot submit a review (eligibility).
