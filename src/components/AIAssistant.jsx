import { useLayoutEffect, useState } from 'react';
import portfolioData from '../../data/portfolioData.json';
import WalkingAvatar from './avatar/WalkingAvatar';
import ChatPopup, { useChat } from './avatar/ChatPopup';
import { PHASE } from './avatar/avatarMachine';
import { useAvatarRoam } from './avatar/useAvatarRoam';
import { createSound } from './avatar/sound';

const sound = createSound();
const facts = portfolioData.avatarFacts ?? [];

const AIAssistant = () => {
  const roam = useAvatarRoam({ facts, sound });
  const chat = useChat();
  const open = roam.phase === PHASE.CHATTING;
  const [anchorX, setAnchorX] = useState(null);

  // Anchor the popup to wherever he is standing when it opens.
  useLayoutEffect(() => {
    if (open && roam.actorRef.current) {
      const r = roam.actorRef.current.getBoundingClientRect();
      setAnchorX(r.left + r.width / 2);
    }
  }, [open, roam.actorRef]);

  return (
    <>
      <WalkingAvatar roam={roam} />
      {open && <ChatPopup chat={chat} anchorX={anchorX} onClose={roam.closeChat} />}
    </>
  );
};

export default AIAssistant;
