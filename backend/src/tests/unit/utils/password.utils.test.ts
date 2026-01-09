import { hashPassword, comparePassword } from '../../../../src/utils/password.utils';
describe('Password Utils', () => { 
  describe('hashPassword', () => { 
    test('should hash password successfully', async () => { 
      // ARRANGE 
      const plainPassword = 'mySecurePassword123'; 
      // ACT 
      const hashedPassword = await hashPassword(plainPassword); 
      // ASSERT 
      expect(hashedPassword).toBeDefined(); 
      expect(typeof hashedPassword).toBe('string'); 
      expect(hashedPassword).not.toBe(plainPassword); // Hash should not 
    }); 
    test('should generate bcrypt hash with correct format', async () => {
      // ARRANGE 
      const password = 'testPassword'; 
      // ACT 
      const hash = await hashPassword(password); 
      // ASSERT 
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt format: $2a$1
      expect(hash).toHaveLength(60); // bcrypt hash is always 60 chars 
    }); 
    test('should generate different hashes for same password', async() => {
      // ARRANGE 
      const password = 'samePassword'; 
      // ACT 
      const hash1 = await hashPassword(password); 
      const hash2 = await hashPassword(password); 
      // ASSERT 
      expect(hash1).not.toBe(hash2); // Different salt = different hash 
    }); 
    test('should handle empty string password', async () => { 
      // ARRANGE 
      const emptyPassword = ''; 
      // ACT 
      const hash = await hashPassword(emptyPassword); 
      // ASSERT 
      expect(hash).toBeDefined(); 
      expect(hash).toHaveLength(60); 
    }); 
    test('should hash long passwords correctly', async () => { 
      // ARRANGE 
      const longPassword = 'a'.repeat(100); 
      // ACT 
      const hash = await hashPassword(longPassword); 
      // ASSERT 
      expect(hash).toBeDefined(); 
      expect(hash).toHaveLength(60); 
    }); 
    test('should hash passwords with special characters', async () => { 
      // ARRANGE 
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'; 
      // ACT 
      const hash = await hashPassword(specialPassword); 
      // ASSERT 
      expect(hash).toBeDefined(); 
      expect(hash).toHaveLength(60); 
    }); 
  });
  describe('comparePassword', () => { 
    test('should return true for correct password', async () => { 
      // ARRANGE 
      const password = 'correctPassword123'; 
      const hash = await hashPassword(password); 
      // ACT 
      const isMatch = await comparePassword(password, hash); 
      // ASSERT 
      expect(isMatch).toBe(true); 
    }); 
    test('should return false for incorrect password', async () => { 
      // ARRANGE 
      const correctPassword = 'correctPassword'; 
      const wrongPassword = 'wrongPassword'; 
      const hash = await hashPassword(correctPassword); 
      // ACT 
      const isMatch = await comparePassword(wrongPassword, hash); 
      // ASSERT 
      expect(isMatch).toBe(false); 
    }); 
    test('should return false for similar but not identical password', async () => {

      const password = 'Password123'; 
      const similarPassword = 'password123'; // Different case 
      const hash = await hashPassword(password); 
      // ACT 
      const isMatch = await comparePassword(similarPassword, hash); 
      // ASSERT 
      expect(isMatch).toBe(false); 
    }); 
    test('should return false for empty password against hash', async() => {
      // ARRANGE 
      const password = 'actualPassword'; 
      const hash = await hashPassword(password); 
      // ACT 
      const isMatch = await comparePassword('', hash); 
      // ASSERT 
      expect(isMatch).toBe(false); 
    }); 
    test('should handle comparison with invalid hash gracefully', async () => {
      // ARRANGE
      const password = 'testPassword';
      const invalidHash = 'not-a-valid-bcrypt-hash';
      // ACT
      const isMatch = await comparePassword(password, invalidHash);
      // ASSERT - bcryptjs returns false for invalid hashes rather than throwing
      expect(isMatch).toBe(false);
    }); 
    test('should be case sensitive', async () => { 
      // ARRANGE 
      const password = 'CaseSensitive'; 
      const hash = await hashPassword(password); 
      // ACT 
      const matchLower = await comparePassword('casesensitive', hash); 
      const matchUpper = await comparePassword('CASESENSITIVE', hash); 
      const matchCorrect = await comparePassword('CaseSensitive', hash); 
      // ASSERT 
      expect(matchLower).toBe(false); 
      expect(matchUpper).toBe(false); 
      expect(matchCorrect).toBe(true); 
    }); 
    test('should handle unicode characters in password', async () => { 
      // ARRANGE 
      const unicodePassword = 'пароль123'; // Russian characters 
      const hash = await hashPassword(unicodePassword); 
      // ACT 
      const isMatch = await comparePassword(unicodePassword, hash); 
      // ASSERT 
      expect(isMatch).toBe(true); 
    }); 
  });
  describe('Password Security', () => { 
    test('hashed password should not contain original password', async () => {
      // ARRANGE 
      const password = 'secretPassword'; 
      // ACT 
      const hash = await hashPassword(password); 
      // ASSERT 
      expect(hash).not.toContain(password); 
      expect(hash.toLowerCase()).not.toContain(password.toLowerCase()); 
    }); 
    test('should use appropriate salt rounds (performance vs security)', async () => {
      // ARRANGE 
      const password = 'testPassword'; 
      // ACT 
      const startTime = Date.now(); 
      await hashPassword(password); 
      const duration = Date.now() - startTime; 
      // ASSERT 
      // With 10 salt rounds, hashing should take 50-200ms 
      expect(duration).toBeGreaterThan(20); // Not too fast = secure 
      expect(duration).toBeLessThan(500);   // Not too slow = usable 
    }); 
    test('multiple hashes of same password should all verify correctly', async () => {
      // ARRANGE 
      const password = 'samePassword'; 
      const hash1 = await hashPassword(password); 
      const hash2 = await hashPassword(password); 
      const hash3 = await hashPassword(password); 
      // ACT & ASSERT 
      expect(await comparePassword(password, hash1)).toBe(true); 
      expect(await comparePassword(password, hash2)).toBe(true); 
      expect(await comparePassword(password, hash3)).toBe(true); 
    }); 
  });
  describe('Edge Cases', () => { 
    test('should handle password with only spaces', async () => { 
      // ARRANGE 
      const spacesPassword = '     '; 
      // ACT 
      const hash = await hashPassword(spacesPassword); 
      const isMatch = await comparePassword(spacesPassword, hash); 
      // ASSERT 
      expect(hash).toBeDefined(); 
      expect(isMatch).toBe(true); 
    }); 
    test('should handle password with newlines', async () => { 
      // ARRANGE 
      const passwordWithNewline = 'pass\nword'; 
      // ACT 
      const hash = await hashPassword(passwordWithNewline); 
      const isMatch = await comparePassword(passwordWithNewline, hash); 
      // ASSERT 
      expect(isMatch).toBe(true); 
    }); 
    test('should differentiate passwords with trailing spaces', async () => { 
      // ARRANGE 
      const password1 = 'password'; 
      const password2 = 'password '; // Trailing space 
      const hash = await hashPassword(password1); 
      // ACT 
      const match1 = await comparePassword(password1, hash); 
      const match2 = await comparePassword(password2, hash); 
      // ASSERT 
      expect(match1).toBe(true); 
      expect(match2).toBe(false); 
    }); 
  });
}); 