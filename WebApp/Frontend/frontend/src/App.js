import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './CommonPages/LoginPage/LoginPage';
import PolicyMakerHomepage from './PolicyMakerPages/PolicyMakerHomepage/PolicyMakerHomepage';
import PolicyMakerDashboard from './PolicyMakerPages/PolicyMakerDashboard/PolicyMakerDashboard';
import PolicyMakerReports from './PolicyMakerPages/PolicyMakerReports/PolicyMakersReports';
import PolicyMakerCompanyDetails from './PolicyMakerPages/PolicyMakerCompanyDetails/PolicyMakerCompanyDetails';
import CompanyRH from './CompanyPages/CompanyProcesses/CompanyRH';
import CompanyHomepage from './CompanyPages/CompanyHomepage/CompanyHomepage';
import ProcessInstance from './CompanyPages/ProcessInstance/ProcessInstance';
import CompanyHistory from './CompanyPages/CompanyHistory/CompanyHistory';
import CompanyRawMaterials from './CompanyPages/CompanyRawMaterials/CompanyRawMaterials';
import CompanySettings from './CompanyPages/CompanySettings/CompanySettings';

function App() {

  const [token, setToken] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setToken(user?.token || null);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {token ? (
          <>
            {/* PolicyMaker Routes*/}
            <Route path="/policy-maker/homepage" element={<PolicyMakerHomepage />}/>
            <Route path="/policy-maker/dashboard" element={<PolicyMakerDashboard />}/>
            <Route path="/policy-maker/reports" element={<PolicyMakerReports />} />
            <Route path='/policy-maker/company-details' element={<PolicyMakerCompanyDetails />} />
            {/* Company Routes*/}
            <Route path='/company/employees' element={<CompanyRH />} />
            <Route path='/company/history' element={<CompanyHistory />} />
            <Route path='/company/homepage' element={<CompanyHomepage />} />
            <Route path='/company/process/:processId' element={<ProcessInstance />} />
            <Route path='/company/raw-materials' element={<CompanyRawMaterials />} />
            <Route path='/company/settings' element={<CompanySettings />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
