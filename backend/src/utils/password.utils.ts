import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};