import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}
  async createUser(
    username: string,
    password: string,
    role: string = 'user'
  ) {
    const hashed = await bcrypt.hash(password, 10);
   const [result]: any = await this.db.execute(
      `INSERT INTO users (username, password, role)
       VALUES (?, ?, ?)`,
      [username, hashed, role],
    );
    return {
      id: result.insertId,
      username,
      role,
    };
  }
  async findByUsername(username: string) {
    const [rows]: any = await this.db.execute(
      `SELECT id, usernamerd, role, refresh_token
       FROM users
       WHERE username = ?`,
      [username],
    );
    return rows[0];
  }
  async findById(id: number) {
        const [rows]: any = await this.db.execute(
      `SELECT id, username, role, created_at
      FROM users
      WHERE id = ?`,
      [id],
    );
    return rows[0];
  }
  async updateUser(
    id: number,
    partial: { username?: string; password?: string; role?: string }
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }
    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }
    if (fields.length === 0) {
      return await this.findById(id);
    }
    values.push(id);
    await this.db.execute(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = ?`,
      values,
    );
    return await this.findById(id);
  }
  async setRefreshToken(
    userId: number,
    refreshToken: string | null
  ) {
    await this.db.execute(
      `UPDATE users
       SET refresh_token = ?
       WHERE id = ?`,
      [refreshToken, userId],
    );
    return { ok: true };
  }
  async findByRefreshToken(refreshToken: string) {
    const [rows]: any = await this.db.execute(
      `SELECT id, username, role
       FROM users
       WHERE refresh_token = ?`,
      [refreshToken],
    );
    return rows[0];
  }
  async getAll() {
  const [rows]: any = await this.db.execute(
    `SELECT id, username, role, created_at
     FROM users`,
  );

  return rows;
}
async deleteUser(id: number) {
  await this.db.execute(
    `DELETE FROM users WHERE id = ?`,
    [id],
  );
  return { message: 'User deleted successfully' };
 }
}