import React, { useState, useEffect } from 'react';
import './CompanyHistory.scss';
import CompanyNavbar from '../../Components/CompanyNavbar/CompanyNavbar';
import axios from 'axios';

export default function CompanyHistory() {
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setRowsPerPage(5);
            } else if (window.innerWidth < 1800) {
                setRowsPerPage(7);
            } else {
                setRowsPerPage(10);
            }
            setCurrentPage(1); // Reset to first page on resizes
        };

        handleResize(); // Initialize rowsPerPage based on current size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/get-company-process-history/${user.user_id}`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching company process history:", error);
            });
    }, [user.user_id]);

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentRows = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const formatDate = (isoString) => {
      if (!isoString) return '-';
      const date = new Date(isoString);
      return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
        <div className="company-processes">
            <CompanyNavbar />
            <div className="company-processes-content">
                <div className="company-processes-header">
                    <h1>Histórico de Processos</h1>
                </div>
                <div className="company-processes-processes">
                    <div className="company-processes-table-wrapper no-scroll">
                        <table className="company-processes-table">
                            <thead>
                                <tr>
                                    <th>Lote</th>
                                    <th>Nome do Processo</th>
                                    <th>Data de Início</th>
                                    <th>Data de Fim</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.batch_number}</td>
                                        <td>{item.process_type.type}</td>
                                        <td>{formatDate(item.start_date)}</td>
                                        <td>{formatDate(item.end_date)}</td>
                                        <td>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-pagination">
                        <button onClick={handlePrevious} disabled={currentPage === 1}>
                            Anterior
                        </button>
                        <span>
                            Página {currentPage} de {totalPages}
                        </span>
                        <button onClick={handleNext} disabled={currentPage === totalPages}>
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
