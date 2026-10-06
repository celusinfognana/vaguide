import React, { useState, useEffect } from 'react';
import { fetchOverview, saveOverview } from '../services/managementApi';
import { Overview } from '../types';

interface OverviewEditorProps {
    propertyId: string;
}

const OverviewEditor: React.FC<OverviewEditorProps> = ({ propertyId }) => {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const data = await fetchOverview(propertyId);
                setOverview(data);
            } catch (err) {
                setError('Failed to load overview');
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [propertyId]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (overview) {
            setOverview({ ...overview, content: event.target.value });
        }
    };

    const handleSave = async () => {
        if (overview) {
            try {
                await saveOverview(propertyId, overview);
                alert('Overview saved successfully!');
            } catch (err) {
                setError('Failed to save overview');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Edit Overview</h2>
            <textarea
                value={overview?.content || ''}
                onChange={handleChange}
                rows={10}
                cols={50}
            />
            <button onClick={handleSave}>Save Overview</button>
        </div>
    );
};

export default OverviewEditor;