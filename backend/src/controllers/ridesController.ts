import express from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';

export const getLifts = async (req: Request, res: Response) => {
    try {
        const { cardSerial, dateFrom, dateTo } = req.query;

        if (!cardSerial) {
            return res.status(400).json({ error: 'cardSerial is required' });
        }

        const where: any = {
            cardSerial: String(cardSerial),
        };

        if (dateFrom || dateTo) {
            where.timeStart = {};
            if (dateFrom) {
                where.timeStart.gte = new Date(String(dateFrom));
            }
            if (dateTo) {
                where.timeStart.lte = new Date(String(dateTo));
            }
        }

        const lifts = await prisma.heis_Turer.findMany({
            where,
            orderBy: {
                timeStart: 'asc',
            },
        });

        return res.json(lifts);
    } catch (error) {
        console.error('Error fetching lift rides:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getRoutes = async (req: Request, res: Response) => {
    try {
        const { cardSerial, dateFrom, dateTo } = req.query;

        if (!cardSerial) {
            return res.status(400).json({ error: 'cardSerial is required' });
        }

        const where: any = {
            cardSerial: String(cardSerial),
        };

        if (dateFrom || dateTo) {
            where.timeFirstLift = {};
            if (dateFrom) {
                where.timeFirstLift.gte = new Date(String(dateFrom));
            }
            if (dateTo) {
                where.timeFirstLift.lte = new Date(String(dateTo));
            }
        }

        const routes = await prisma.turer.findMany({
            where,
            orderBy: {
                timeFirstLift: 'asc',
            },
        });

        return res.json(routes);
    } catch (error) {
        console.error('Error fetching computed routes:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateRoute = async (req: Request, res: Response) => {
    try {
        const { turID } = req.params;
        const { cardSerial, nyRoute } = req.body;

        if (!cardSerial || !nyRoute) {
            return res.status(400).json({ error: 'cardSerial and nyRoute are required in body' });
        }

        // Verify the existing route belongs to the user
        const existingRoute = await prisma.turer.findUnique({
            where: { turID: Number(turID) },
        });

        if (!existingRoute) {
            return res.status(404).json({ error: 'Route not found' });
        }

        if (existingRoute.cardSerial !== String(cardSerial)) {
            return res.status(403).json({ error: 'Forsøk på å endre andres rute er ikke tillatt (Forbidden)' });
        }

        // Update the route array
        await prisma.turer.update({
            where: { turID: Number(turID) },
            data: { route: nyRoute },
        });

        // 200 OK could be used to return the updated object, but plan says 200 OK or 204
        return res.status(200).json({ message: 'Route updated successfully' });
    } catch (error) {
        console.error('Error updating route:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
