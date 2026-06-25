import { RepoValidator } from './repo-validator';

describe('RepoValidator', () => {
  it('should create an instance', () => {
    const directive = new RepoValidator();
    expect(directive).toBeTruthy();
  });
});
