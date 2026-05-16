export const generateRandomInviteCode = (codeLength: number = 12) => {
  const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const code = [];
  for (let i = 0; i < codeLength; i++) {
    const randIdx = Math.floor(Math.random() * characterSet.length + 1);
    code.push(characterSet[randIdx]!);
  }

  return code.join('');
};
