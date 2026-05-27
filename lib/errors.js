export class TwError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TwError';
  }
}
