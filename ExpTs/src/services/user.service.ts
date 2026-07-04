import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { CreateUserInput } from '../types/user.types';

const SALT_ROUNDS = 10;

export const userService = {

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  async create(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return prisma.user.create({
      data: {
        fullname: data.fullname,
        email: data.email,
        password: hashedPassword,
        majorId: data.majorId
      }
    });
  }

};