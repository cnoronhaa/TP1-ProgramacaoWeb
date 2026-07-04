import { Request, Response } from 'express';
import { majorService } from '../services/major.service';

export const majorController = {

  async list(req: Request, res: Response) {
    const majors = await majorService.findAll();
    res.render('major/list', {
      title: 'Cursos',
      majors
    });
  },

  createForm(req: Request, res: Response) {
    res.render('major/create', {
      title: 'Criação de Curso'
    });
  },

  async create(req: Request, res: Response) {
    const { name, code, description } = req.body;
    await majorService.create({ name, code, description });
    res.redirect('/major');
  },

  async remove(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await majorService.remove(id);
    res.status(200).json({ success: true });
  }

};