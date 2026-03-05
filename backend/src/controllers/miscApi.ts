import { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';

export const verifyCardSerial = async (req: Request, res: Response) => {
    try {
         const {cardSerial} = req.query;
        
         if (!cardSerial) {
            return res.status(400)
         }

         const entry = await prisma.heis_Turer.findFirst({
            where: {
                cardSerial: String(cardSerial)
            }
         })

         if (entry) {
            return res.status(200)
         } else {
            return res.status(404)
         }
    }
}