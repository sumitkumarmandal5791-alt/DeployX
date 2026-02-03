const badges = {
  FIRST_RECYCLER: {
    id: 'FIRST_RECYCLER',
    name: 'First Recycler',
    description: 'Recycled your first item',
    icon: '🌱',
    condition: (user) => user.totalItemsRecycled >= 1
  },
  
  ECO_WARRIOR: {
    id: 'ECO_WARRIOR',
    name: 'Eco Warrior',
    description: 'Recycled 10 items',
    icon: '♻️',
    condition: (user) => user.totalItemsRecycled >= 10
  },
  
  RECYCLING_CHAMPION: {
    id: 'RECYCLING_CHAMPION',
    name: 'Recycling Champion',
    description: 'Recycled 50 items',
    icon: '🏆',
    condition: (user) => user.totalItemsRecycled >= 50
  },
  
  POINT_COLLECTOR: {
    id: 'POINT_COLLECTOR',
    name: 'Point Collector',
    description: 'Earned 100 points',
    icon: '⭐',
    condition: (user) => user.totalPoints >= 100
  },
  
  CARBON_SAVER: {
    id: 'CARBON_SAVER',
    name: 'Carbon Saver',
    description: 'Saved 1000mg of CO2',
    icon: '🌍',
    condition: (user) => user.totalCO2Saved >= 1000
  },
  
};


function checkBadges(user) {
  const newBadges = [];
  
  for (const badge of Object.values(badges)) {
    if (badge.condition(user)) {
      const awarded = user.awardBadge(badge.id, badge.name);
      if (awarded) {
        newBadges.push(badge);
      }
    }
  }
  
  return newBadges;
}

module.exports = { badges, checkBadges };