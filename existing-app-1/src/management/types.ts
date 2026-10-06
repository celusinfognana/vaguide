export interface Property {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Overview {
    propertyId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcedureCard {
    id: string;
    propertyId: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcessFlow {
    procedureCardId: string;
    steps: FlowStep[];
}

export interface FlowStep {
    id: string;
    title: string;
    type: 'normal' | 'decision' | 'branch';
    nextSteps: string[]; // IDs of next steps
    createdAt: Date;
    updatedAt: Date;
}