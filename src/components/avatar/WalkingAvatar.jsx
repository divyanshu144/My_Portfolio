import { BikeArt, ManArt } from './AvatarFigure';
import { PHASE, poseFor } from './avatarMachine';

const FLAG_PHASES = new Set([PHASE.RIDING, PHASE.PARKED]);

const WalkingAvatar = ({ roam }) => {
  const hop = roam.phase === PHASE.MOUNTING || roam.phase === PHASE.DISMOUNTING;

  return (
    <div className="wa" data-phase={roam.phase}>
      <div className="wa-bike" ref={roam.bikeRef}>
        <BikeArt />
        <button
          className="wa-flag"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          data-visible={FLAG_PHASES.has(roam.phase) ? '1' : '0'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={roam.handlers.onClick}
        >
          <span className="wa-flag-pole" />
          <span className="wa-flag-cloth">Ask me<br />anything</span>
        </button>
      </div>

      <div
        className="wa-actor"
        ref={roam.actorRef}
        data-pose={poseFor(roam.phase, roam.reducedMotion)}
        data-hop={hop ? '1' : '0'}
      >
        {roam.bubble && (
          <div key={roam.bubble.text} className={`wa-bubble wa-bubble--${roam.bubble.kind}`} aria-hidden="true">
            {roam.bubble.text}
          </div>
        )}
        <button className="wa-man" type="button" aria-label="Ask Div, chat with me" {...roam.handlers}>
          <ManArt />
        </button>
      </div>
    </div>
  );
};

export default WalkingAvatar;
