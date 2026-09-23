// ── SUPABASE CLIENT ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ciwdchbvqnjovtyzvont.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fXTv4M2TbTlzhV4EcMHNtQ_yLsoe9xy";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

const api = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...headers, ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Supabase error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const getUsers = () =>
  api("users?select=*&order=created_at.asc");

export const getUserByEmail = (email) =>
  api(`users?email=eq.${encodeURIComponent(email)}&select=*`).then(r => r?.[0] || null);

export const createUser = (user) =>
  api("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(user),
  }).then(r => r?.[0]);

// ── WORKOUTS ──────────────────────────────────────────────────────────────────
export const getWorkoutsForClient = (clientId) =>
  api(`workouts?client_id=eq.${clientId}&select=*,exercises(*)&order=created_at.asc`);

export const getAllWorkouts = () =>
  api("workouts?select=*,exercises(*)&order=created_at.asc");

export const createWorkout = (workout) =>
  api("workouts?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(workout),
  }).then(r => r?.[0]);

export const deleteWorkout = (id) =>
  api(`workouts?id=eq.${id}`, { method: "DELETE" });

// ── EXERCISES ─────────────────────────────────────────────────────────────────
export const addExercise = (exercise) =>
  api("exercises?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(exercise),
  }).then(r => r?.[0]);

export const updateExercise = (id, data) =>
  api(`exercises?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(data),
  });

export const deleteExercise = (id) =>
  api(`exercises?id=eq.${id}`, { method: "DELETE" });

// ── SCHEDULE ──────────────────────────────────────────────────────────────────
export const getSchedule = (clientId) =>
  api(`schedule?client_id=eq.${clientId}&select=*`);

export const getAllSchedules = () =>
  api("schedule?select=*");

export const upsertScheduleDay = (row) =>
  api("schedule?on_conflict=client_id,day_index", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });

export const deleteScheduleDay = (clientId, dayIndex) =>
  api(`schedule?client_id=eq.${clientId}&day_index=eq.${dayIndex}`, { method: "DELETE" });

export const deleteScheduleByWorkout = (workoutId) =>
  api(`schedule?workout_id=eq.${workoutId}`, { method: "DELETE" });
