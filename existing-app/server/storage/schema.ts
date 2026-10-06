import { Schema, model } from 'mongoose';

const PropertySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const OverviewSchema = new Schema({
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProcedureCardSchema = new Schema({
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    title: { type: String, required: true },
    steps: [{ type: Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProcessFlowSchema = new Schema({
    procedureCardId: { type: Schema.Types.ObjectId, ref: 'ProcedureCard', required: true },
    steps: [{ type: Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Property = model('Property', PropertySchema);
export const Overview = model('Overview', OverviewSchema);
export const ProcedureCard = model('ProcedureCard', ProcedureCardSchema);
export const ProcessFlow = model('ProcessFlow', ProcessFlowSchema);