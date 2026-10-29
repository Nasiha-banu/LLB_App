const propertyViewers = new Map(); // propertyId -> Set of socketIds

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Join property room and track live viewers
    socket.on('property:join', ({ propertyId }) => {
      if (!propertyId) return;
      socket.join(`prop_${propertyId}`);

      if (!propertyViewers.has(propertyId)) {
        propertyViewers.set(propertyId, new Set());
      }
      propertyViewers.get(propertyId).add(socket.id);

      // Add a realistic base active viewer count (2-5 HNIs)
      const count = propertyViewers.get(propertyId).size + 2;
      io.to(`prop_${propertyId}`).emit('property:viewers_update', {
        propertyId,
        count
      });
    });

    // Leave property room
    socket.on('property:leave', ({ propertyId }) => {
      if (!propertyId) return;
      socket.leave(`prop_${propertyId}`);

      if (propertyViewers.has(propertyId)) {
        propertyViewers.get(propertyId).delete(socket.id);
        const count = Math.max(1, propertyViewers.get(propertyId).size + 2);
        io.to(`prop_${propertyId}`).emit('property:viewers_update', {
          propertyId,
          count
        });
      }
    });

    // Live Concierge Chat
    socket.on('chat:send', ({ propertyId, message, senderName, senderRole }) => {
      const chatRoom = propertyId ? `chat_${propertyId}` : `chat_general_${socket.id}`;
      socket.join(chatRoom);

      const clientMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender: senderName || 'Valued Client',
        role: senderRole || 'Client',
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdvisor: false
      };

      // Broadcast client message
      io.to(chatRoom).emit('chat:received', clientMsg);

      // Simulate intelligent concierge auto-reply after 800ms
      setTimeout(() => {
        const advisorReply = generateAdvisorReply(message);
        io.to(chatRoom).emit('chat:received', {
          id: `msg-adv-${Date.now()}`,
          sender: 'Siddharth Ramanathan',
          role: 'Senior Private Acquisitions Advisor (LLB)',
          message: advisorReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAdvisor: true
        });
      }, 800);
    });

    socket.on('disconnect', () => {
      // Clean up viewer sets
      for (const [propId, set] of propertyViewers.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          const count = Math.max(1, set.size + 2);
          io.to(`prop_${propId}`).emit('property:viewers_update', {
            propertyId: propId,
            count
          });
        }
      }
    });
  });
}

function generateAdvisorReply(text) {
  const lower = (text || '').toLowerCase();

  if (lower.includes('guideline') || lower.includes('govt') || lower.includes('rate')) {
    return 'Our valuations are strictly indexed against the latest Tamil Nadu Registration Department guideline rates. We provide a full breakdown showing guideline value, prevailing fair market value, and stamp duty variance before any token deposit.';
  }

  if (lower.includes('tour') || lower.includes('visit') || lower.includes('chauffeur') || lower.includes('see')) {
    return 'We would be honored to arrange an on-site private inspection. Our chauffeur can pick you up in a Mercedes S-Class directly from your residence or the airport. Would tomorrow morning at 10:30 AM suit your schedule?';
  }

  if (lower.includes('rera') || lower.includes('cmda') || lower.includes('patta') || lower.includes('legal')) {
    return 'Every parcel represented in our portfolio undergoes a 40-year parent title scrutiny by our Senior Madras High Court legal counsel. TN RERA registration, CMDA planning permits, and unencumbered computer Patta are ready for your advocate’s immediate inspection.';
  }

  if (lower.includes('price') || lower.includes('discount') || lower.includes('negotiable')) {
    return 'The quoted pricing represents the seller\'s certified guideline-indexed market valuation. For qualified HNI buyers with immediate closing terms, our Managing Partner can arrange a private confidential round table with the title holder.';
  }

  if (lower.includes('ecr') || lower.includes('beach') || lower.includes('coastal')) {
    return 'East Coast Road (ECR) parcels between Neelankarai and Uthandi remain Chennai\'s highest capital appreciation coastal corridor. All our seaside listings possess CRZ-II environmental sanctions and sweet groundwater at 25 feet.';
  }

  return 'Thank you for reaching out to LLB Real Estate Concierge. I have linked this conversation to your client profile and am reviewing your inquiry. How else may I assist your acquisition criteria today?';
}

module.exports = setupSocket;
