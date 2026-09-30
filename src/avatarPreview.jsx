import { createRoot } from 'react-dom/client'
import './vcard.css'
import './index.css'
import { BikeArt, ManArt } from './components/avatar/AvatarFigure'

// Temporary: static poses for checking the art. Deleted in the last task.
const Cell = ({ label, pose, moving, facing = 1, withBike = false }) => (
  <div style={{ margin: 12, color: '#ddd', font: '12px Poppins, sans-serif' }}>
    <div style={{ position: 'relative', width: 220, height: 110, background: '#1c1c1e', borderRadius: 12 }}>
      {withBike && (
        <div className="wa-bike" data-facing={facing} data-moving={moving ? '1' : '0'} style={{ position: 'absolute', bottom: 0, left: 30 }}>
          <BikeArt />
        </div>
      )}
      <div
        className="wa-actor"
        data-pose={pose}
        data-facing={facing}
        data-moving={moving ? '1' : '0'}
        style={{ position: 'absolute', bottom: 0, left: withBike ? (facing === 1 ? 30 + 10 : 30 + 32) : 80 }}
      >
        <div className="wa-man" style={{ pointerEvents: 'none' }}><ManArt /></div>
      </div>
    </div>
    <div>{label}</div>
  </div>
)

createRoot(document.getElementById('root')).render(
  <div style={{ display: 'flex', flexWrap: 'wrap', padding: 16, background: '#111' }}>
    <Cell label="standing" pose="ground" moving={false} />
    <Cell label="walking" pose="ground" moving />
    <Cell label="walking (facing left)" pose="ground" moving facing={-1} />
    <Cell label="seated, stopped" pose="seated" moving={false} withBike />
    <Cell label="riding" pose="seated" moving withBike />
    <Cell label="riding (facing left)" pose="seated" moving facing={-1} withBike />
  </div>,
)
