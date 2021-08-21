exports.numberToDiscordEmoji = number => {
  const numbers = {
    '1': ":one:",
    '2': ":two:",
    '3': ":three:",
    '4': ":four:",
    '5': ":five:",
    '6': ":six:",
    '7': ":seven:",
    '8': ":eight:",
    '9': ":nine:",
    '0': ":zero:"
  };
return number.toString().replace(/[0-9]/gi, matched => numbers[matched]);
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

exports.ValidationError = ValidationError; 