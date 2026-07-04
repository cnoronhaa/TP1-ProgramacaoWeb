import { prisma } from '../lib/prisma';
import { CreateMajorInput, UpdateMajorInput } from '../types/major.types';

export const majorService = {

  findAll() {
    return prisma.major.findMany({
      orderBy: { name: 'asc' }
    });
  },

  findById(id: string) {
    return prisma.major.findUnique({
      where: { id }
    });
  },

  create(data: CreateMajorInput) {
    return prisma.major.create({ data });
  },

  update(id: string, data: UpdateMajorInput) {
    return prisma.major.update({
      where: { id },
      data
    });
  },

  remove(id: string) {
    return prisma.major.delete({
      where: { id }
    });
  }

};