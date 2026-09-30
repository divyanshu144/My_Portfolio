export const PHASE = {
  ARRIVING: 'arriving',            // standing a few steps from the bike
  WALKING_TO_BIKE: 'walkingToBike', // intro walk, and every return to the bike
  MOUNTING: 'mounting',            // hopping on (bell plays here)
  RIDING: 'riding',
  BRAKING: 'braking',
  DISMOUNTING: 'dismounting',      // he stays put, the bike coasts ahead
  WAITING: 'waiting',              // standing beside the bike, "Want to chat?"
  CHATTING: 'chatting',            // popup open
  PARKED: 'parked',                // reduced motion: seated, not moving
};

export const EVENT = {
  START: 'START',
  INTRO_BEGIN: 'INTRO_BEGIN',
  REACHED_BIKE: 'REACHED_BIKE',
  MOUNT_DONE: 'MOUNT_DONE',
  HOVER_START: 'HOVER_START',
  BRAKE_DONE: 'BRAKE_DONE',
  DISMOUNT_DONE: 'DISMOUNT_DONE',
  GRACE_ELAPSED: 'GRACE_ELAPSED',
  OPEN_CHAT: 'OPEN_CHAT',
  CLOSE_CHAT: 'CLOSE_CHAT',
};

export function avatarReducer(state, event) {
  const { phase } = state;
  const to = (next, extra = {}) => ({ ...state, phase: next, ...extra });

  switch (event.type) {
    case EVENT.START:
      if (event.reducedMotion) return { phase: PHASE.PARKED, pendingChat: false, reducedMotion: true };
      return { phase: event.introDone ? PHASE.RIDING : PHASE.ARRIVING, pendingChat: false, reducedMotion: false };

    case EVENT.INTRO_BEGIN:
      return phase === PHASE.ARRIVING ? to(PHASE.WALKING_TO_BIKE) : state;

    case EVENT.REACHED_BIKE:
      return phase === PHASE.WALKING_TO_BIKE ? to(PHASE.MOUNTING) : state;

    case EVENT.MOUNT_DONE:
      return phase === PHASE.MOUNTING ? to(PHASE.RIDING) : state;

    case EVENT.HOVER_START:
      if (state.reducedMotion) return state;
      if (phase === PHASE.RIDING || phase === PHASE.MOUNTING) return to(PHASE.BRAKING);
      if (phase === PHASE.ARRIVING || phase === PHASE.WALKING_TO_BIKE) return to(PHASE.WAITING);
      return state;

    case EVENT.BRAKE_DONE:
      return phase === PHASE.BRAKING ? to(PHASE.DISMOUNTING) : state;

    case EVENT.DISMOUNT_DONE:
      if (phase !== PHASE.DISMOUNTING) return state;
      return state.pendingChat ? to(PHASE.CHATTING, { pendingChat: false }) : to(PHASE.WAITING);

    case EVENT.GRACE_ELAPSED:
      return phase === PHASE.WAITING ? to(PHASE.WALKING_TO_BIKE) : state;

    case EVENT.OPEN_CHAT:
      switch (phase) {
        case PHASE.WAITING:
        case PHASE.PARKED:
        case PHASE.ARRIVING:
        case PHASE.WALKING_TO_BIKE:
          return to(PHASE.CHATTING);
        case PHASE.RIDING:
        case PHASE.MOUNTING:
          return to(PHASE.BRAKING, { pendingChat: true });
        case PHASE.BRAKING:
        case PHASE.DISMOUNTING:
          return state.pendingChat ? state : to(phase, { pendingChat: true });
        default:
          return state;
      }

    case EVENT.CLOSE_CHAT:
      return phase === PHASE.CHATTING ? to(state.reducedMotion ? PHASE.PARKED : PHASE.WALKING_TO_BIKE) : state;

    default:
      return state;
  }
}
