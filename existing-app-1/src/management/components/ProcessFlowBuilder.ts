import React, { useState } from 'react';

interface Step {
    id: string;
    description: string;
}

interface Branch {
    id: string;
    condition: string;
    steps: Step[];
}

interface ProcessFlow {
    steps: Step[];
    branches: Branch[];
}

const ProcessFlowBuilder: React.FC = () => {
    const [processFlow, setProcessFlow] = useState<ProcessFlow>({ steps: [], branches: [] });

    const addStep = () => {
        const newStep: Step = { id: Date.now().toString(), description: '' };
        setProcessFlow(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    const editStep = (id: string, description: string) => {
        setProcessFlow(prev => ({
            ...prev,
            steps: prev.steps.map(step => (step.id === id ? { ...step, description } : step))
        }));
    };

    const deleteStep = (id: string) => {
        setProcessFlow(prev => ({
            ...prev,
            steps: prev.steps.filter(step => step.id !== id)
        }));
    };

    const addBranch = () => {
        const newBranch: Branch = { id: Date.now().toString(), condition: '', steps: [] };
        setProcessFlow(prev => ({ ...prev, branches: [...prev.branches, newBranch] }));
    };

    const editBranch = (id: string, condition: string) => {
        setProcessFlow(prev => ({
            ...prev,
            branches: prev.branches.map(branch => (branch.id === id ? { ...branch, condition } : branch))
        }));
    };

    const deleteBranch = (id: string) => {
        setProcessFlow(prev => ({
            ...prev,
            branches: prev.branches.filter(branch => branch.id !== id)
        }));
    };

    const reorderSteps = (sourceIndex: number, destinationIndex: number) => {
        const newSteps = Array.from(processFlow.steps);
        const [removed] = newSteps.splice(sourceIndex, 1);
        newSteps.splice(destinationIndex, 0, removed);
        setProcessFlow(prev => ({ ...prev, steps: newSteps }));
    };

    const saveProcessFlow = () => {
        // Logic to save process flow to the backend
    };

    return (
        <div>
            <h2>Process Flow Builder</h2>
            <button onClick={addStep}>Add Step</button>
            <button onClick={addBranch}>Add Branch</button>
            {/* Render steps and branches here */}
            <button onClick={saveProcessFlow}>Save Process Flow</button>
        </div>
    );
};

export default ProcessFlowBuilder;