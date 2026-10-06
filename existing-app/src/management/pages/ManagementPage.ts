import React from 'react';
import PropertyManager from '../components/PropertyManager';
import OverviewEditor from '../components/OverviewEditor';
import ProcedureCardEditor from '../components/ProcedureCardEditor';
import ProcessFlowBuilder from '../components/ProcessFlowBuilder';

const ManagementPage = () => {
    return (
        <div>
            <h1>Admin Management Dashboard</h1>
            <PropertyManager />
            <OverviewEditor />
            <ProcedureCardEditor />
            <ProcessFlowBuilder />
        </div>
    );
};

export default ManagementPage;