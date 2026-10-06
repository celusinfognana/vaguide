import { Property } from '../types';
import { managementApi } from '../services/managementApi';

export class PropertyManager {
    private properties: Property[] = [];

    constructor() {
        this.loadProperties();
    }

    private async loadProperties() {
        this.properties = await managementApi.fetchProperties();
    }

    public async addProperty(property: Property) {
        const newProperty = await managementApi.createProperty(property);
        this.properties.push(newProperty);
    }

    public async editProperty(updatedProperty: Property) {
        const index = this.properties.findIndex(prop => prop.id === updatedProperty.id);
        if (index !== -1) {
            this.properties[index] = await managementApi.updateProperty(updatedProperty);
        }
    }

    public async deleteProperty(propertyId: string) {
        await managementApi.deleteProperty(propertyId);
        this.properties = this.properties.filter(prop => prop.id !== propertyId);
    }

    public getProperties() {
        return this.properties;
    }
}