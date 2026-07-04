import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CandidateCard from '../../components/candidates/CandidateCard';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { mockCandidates } from '../../data/mockData';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCandidates(mockCandidates || []);
      setLoading(false);
    }, 600);
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Candidates</h1>
        <div className="w-64">
          <SearchBar placeholder="Search candidates..." onSearch={setSearch} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate}
              onClick={() => navigate(`/candidates/${candidate.id}`)}
            />
          ))}
          {filteredCandidates.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No candidates found matching "{search}"
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CandidatesList;
