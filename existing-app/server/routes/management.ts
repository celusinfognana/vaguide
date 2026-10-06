import express from 'express';
import { 
    addProperty, 
    editProperty, 
    deleteProperty, 
    addOverview, 
    editOverview, 
    deleteOverview, 
    addProcedureCard, 
    editProcedureCard, 
    deleteProcedureCard 
} from '../services/managementService';

const router = express.Router();

// Properties / Collections Routes
router.post('/properties', async (req, res) => {
    try {
        const property = await addProperty(req.body);
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/properties/:id', async (req, res) => {
    try {
        const property = await editProperty(req.params.id, req.body);
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/properties/:id', async (req, res) => {
    try {
        await deleteProperty(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Overview Routes
router.post('/properties/:propertyId/overview', async (req, res) => {
    try {
        const overview = await addOverview(req.params.propertyId, req.body);
        res.status(201).json(overview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/properties/:propertyId/overview/:id', async (req, res) => {
    try {
        const overview = await editOverview(req.params.propertyId, req.params.id, req.body);
        res.status(200).json(overview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/properties/:propertyId/overview/:id', async (req, res) => {
    try {
        await deleteOverview(req.params.propertyId, req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Procedure Card Routes
router.post('/properties/:propertyId/procedure-cards', async (req, res) => {
    try {
        const procedureCard = await addProcedureCard(req.params.propertyId, req.body);
        res.status(201).json(procedureCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/properties/:propertyId/procedure-cards/:id', async (req, res) => {
    try {
        const procedureCard = await editProcedureCard(req.params.propertyId, req.params.id, req.body);
        res.status(200).json(procedureCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/properties/:propertyId/procedure-cards/:id', async (req, res) => {
    try {
        await deleteProcedureCard(req.params.propertyId, req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;