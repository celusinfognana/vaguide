import axios from 'axios';
import { Property, Overview, ProcedureCard, ProcessFlow } from '../types';

const API_BASE_URL = '/api/management';

export const fetchProperties = async (): Promise<Property[]> => {
    const response = await axios.get(`${API_BASE_URL}/properties`);
    return response.data;
};

export const addProperty = async (property: Property): Promise<Property> => {
    const response = await axios.post(`${API_BASE_URL}/properties`, property);
    return response.data;
};

export const editProperty = async (propertyId: string, property: Property): Promise<Property> => {
    const response = await axios.put(`${API_BASE_URL}/properties/${propertyId}`, property);
    return response.data;
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/properties/${propertyId}`);
};

export const fetchOverview = async (propertyId: string): Promise<Overview> => {
    const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}/overview`);
    return response.data;
};

export const saveOverview = async (propertyId: string, overview: Overview): Promise<Overview> => {
    const response = await axios.put(`${API_BASE_URL}/properties/${propertyId}/overview`, overview);
    return response.data;
};

export const fetchProcedureCards = async (propertyId: string): Promise<ProcedureCard[]> => {
    const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}/procedureCards`);
    return response.data;
};

export const addProcedureCard = async (propertyId: string, procedureCard: ProcedureCard): Promise<ProcedureCard> => {
    const response = await axios.post(`${API_BASE_URL}/properties/${propertyId}/procedureCards`, procedureCard);
    return response.data;
};

export const editProcedureCard = async (propertyId: string, cardId: string, procedureCard: ProcedureCard): Promise<ProcedureCard> => {
    const response = await axios.put(`${API_BASE_URL}/properties/${propertyId}/procedureCards/${cardId}`, procedureCard);
    return response.data;
};

export const deleteProcedureCard = async (propertyId: string, cardId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/properties/${propertyId}/procedureCards/${cardId}`);
};

export const saveProcessFlow = async (propertyId: string, cardId: string, processFlow: ProcessFlow): Promise<ProcessFlow> => {
    const response = await axios.put(`${API_BASE_URL}/properties/${propertyId}/procedureCards/${cardId}/processFlow`, processFlow);
    return response.data;
};