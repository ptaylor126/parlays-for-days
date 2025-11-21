export function getShortTeamName(fullName: string, maxLength: number = 15): string {
  const alwaysShorten = [
    'Manchester City', 'Manchester United', 'Tottenham Hotspur',
    'Wolverhampton Wanderers', 'Brighton and Hove Albion',
    'Nottingham Forest', 'West Ham United', 'Newcastle United'
  ];

  const shortNames: { [key: string]: string } = {
    'Brighton and Hove Albion': 'Brighton', 'Brighton & Hove Albion': 'Brighton',
    'Ipswich Town': 'Ipswich', 'Leicester City': 'Leicester',
    'Manchester City': 'Man City', 'Manchester United': 'Man United',
    'Newcastle United': 'Newcastle', 'Nottingham Forest': "Nott'm Forest",
    'Tottenham Hotspur': 'Spurs', 'West Ham United': 'West Ham',
    'Wolverhampton Wanderers': 'Wolves', 'Wolverhampton': 'Wolves',
  };

  if (alwaysShorten.includes(fullName)) {
    return shortNames[fullName] || fullName;
  }

  if (fullName.length > maxLength && shortNames[fullName]) {
    return shortNames[fullName];
  }

  return fullName;
}

export function getPredictionEmoji(prediction: string): string {
  const pred = prediction.toLowerCase();
  
  // Win predictions
  if (pred.includes('win') || pred.includes('victory')) {
    return '🏆';
  }
  
  // Draw predictions
  if (pred.includes('draw')) {
    return '🤝';
  }
  
  // Goals predictions
  if (pred.includes('over') && pred.includes('goal')) {
    return '⚽';
  }
  
  if (pred.includes('under') && pred.includes('goal')) {
    return '🔒';
  }
  
  // BTTS (Both Teams to Score)
  if (pred.includes('both teams') || pred.includes('btts')) {
    return '⚔️';
  }
  
  // Clean sheet
  if (pred.includes('clean sheet')) {
    return '🛡️';
  }
  
  // Handicap
  if (pred.includes('handicap') || pred.includes('-1') || pred.includes('+1')) {
    return '📊';
  }
  
  // Double chance
  if (pred.includes('double chance')) {
    return '🎯';
  }
  
  // Default - generic target/bullseye
  return '🎯';
}

