import { createRoot } from 'react-dom/client'
import './vcard.css'
import './index.css'
import WalkingAvatar from './components/avatar/WalkingAvatar'
import { useAvatarRoam } from './components/avatar/useAvatarRoam'
import { createSound } from './components/avatar/sound'
import portfolioData from '../data/portfolioData.json'

// Temporary: the live avatar without the chat popup, with a phase read-out. Deleted in the last task.
const sound = createSound()

const Live = () => {
  const roam = useAvatarRoam({ facts: portfolioData.avatarFacts, sound })
  return (
    <>
      <div style={{ padding: 16, color: '#ddd', font: '14px Poppins, sans-serif' }}>
        <p>phase: <b id="phase">{roam.phase}</b></p>
        <p>Hover the avatar, click it, then use the button to close the fake chat.</p>
        {roam.phase === 'chatting' && <button id="close" onClick={roam.closeChat}>close chat</button>}
      </div>
      <WalkingAvatar roam={roam} />
    </>
  )
}

createRoot(document.getElementById('root')).render(<Live />)
