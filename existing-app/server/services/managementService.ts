import { Property, Overview, ProcedureCard, ProcessFlow } from '../management/types';
import { db } from '../storage/database';

export class ManagementService {
    async addProperty(property: Property): Promise<Property> {
        const result = await db.properties.insert(property);
        return result;
    }

    async editProperty(propertyId: string, updatedProperty: Property): Promise<Property> {
        const result = await db.properties.update(propertyId, updatedProperty);
        return result;
    }

    async deleteProperty(propertyId: string): Promise<void> {
        await db.properties.delete(propertyId);
    }

    async addOverview(propertyId: string, overview: Overview): Promise<Overview> {
        const result = await db.overviews.insert({ propertyId, ...overview });
        return result;
    }

    async editOverview(overviewId: string, updatedOverview: Overview): Promise<Overview> {
        const result = await db.overviews.update(overviewId, updatedOverview);
        return result;
    }

    async deleteOverview(overviewId: string): Promise<void> {
        await db.overviews.delete(overviewId);
    }

    async addProcedureCard(propertyId: string, procedureCard: ProcedureCard): Promise<ProcedureCard> {
        const result = await db.procedureCards.insert({ propertyId, ...procedureCard });
        return result;
    }

    async editProcedureCard(cardId: string, updatedCard: ProcedureCard): Promise<ProcedureCard> {
        const result = await db.procedureCards.update(cardId, updatedCard);
        return result;
    }

    async deleteProcedureCard(cardId: string): Promise<void> {
        await db.procedureCards.delete(cardId);
    }

    async addProcessFlow(cardId: string, processFlow: ProcessFlow): Promise<ProcessFlow> {
        const result = await db.processFlows.insert({ cardId, ...processFlow });
        return result;
    }

    async editProcessFlow(flowId: string, updatedFlow: ProcessFlow): Promise<ProcessFlow> {
        const result = await db.processFlows.update(flowId, updatedFlow);
        return result;
    }

    async deleteProcessFlow(flowId: string): Promise<void> {
        await db.processFlows.delete(flowId);
    }
}