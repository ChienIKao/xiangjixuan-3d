import { DEFAULT_STATE, TRANSIENT_KEYS, BEATS } from '../content/script.js';
const clone = value => JSON.parse(JSON.stringify(value));
export const STATES = [];
let accumulated = clone(DEFAULT_STATE);
for (const beat of BEATS) {
  for (const key of TRANSIENT_KEYS) accumulated[key] = clone(DEFAULT_STATE[key]);
  Object.assign(accumulated, clone(beat.state || {}));
  STATES.push(clone(accumulated));
}
export function indexOf(value) {
  const i = typeof value === 'string' ? BEATS.findIndex(b=>b.id===value) : value;
  return Number.isInteger(i) ? Math.min(BEATS.length-1,Math.max(0,i)) : 0;
}
export function stateAt(value) { return clone(STATES[indexOf(value)]); }
export function explorationState(value) {
  const state=stateAt(value);
  for(const key of TRANSIENT_KEYS) state[key]=clone(DEFAULT_STATE[key]);
  return {...state, people:{},cutaway:false,fade:0,vast:false,guest:false,walkers:false,footsteps:false};
}
