import React, { useState, useEffect } from 'react';
import { ProcedureCard } from '../types';
import { managementApi } from '../services/managementApi';

const ProcedureCardEditor: React.FC<{ propertyId: string }> = ({ propertyId }) => {
    const [procedureCards, setProcedureCards] = useState<ProcedureCard[]>([]);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [editingCard, setEditingCard] = useState<ProcedureCard | null>(null);

    useEffect(() => {
        fetchProcedureCards();
    }, [propertyId]);

    const fetchProcedureCards = async () => {
        const cards = await managementApi.getProcedureCards(propertyId);
        setProcedureCards(cards);
    };

    const handleAddCard = async () => {
        if (newCardTitle) {
            const newCard = await managementApi.addProcedureCard(propertyId, newCardTitle);
            setProcedureCards([...procedureCards, newCard]);
            setNewCardTitle('');
        }
    };

    const handleEditCard = async () => {
        if (editingCard) {
            const updatedCard = await managementApi.updateProcedureCard(editingCard.id, editingCard.title);
            setProcedureCards(procedureCards.map(card => (card.id === updatedCard.id ? updatedCard : card)));
            setEditingCard(null);
        }
    };

    const handleDeleteCard = async (id: string) => {
        await managementApi.deleteProcedureCard(id);
        setProcedureCards(procedureCards.filter(card => card.id !== id));
    };

    return (
        <div>
            <h2>Procedure Cards</h2>
            <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="New Procedure Card Title"
            />
            <button onClick={handleAddCard}>Add Procedure Card</button>

            <ul>
                {procedureCards.map(card => (
                    <li key={card.id}>
                        {card.title}
                        <button onClick={() => setEditingCard(card)}>Edit</button>
                        <button onClick={() => handleDeleteCard(card.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {editingCard && (
                <div>
                    <h3>Edit Procedure Card</h3>
                    <input
                        type="text"
                        value={editingCard.title}
                        onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    />
                    <button onClick={handleEditCard}>Save Changes</button>
                    <button onClick={() => setEditingCard(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default ProcedureCardEditor;