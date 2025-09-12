

import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import DataTable from '../../components/DataTable';

export default function CustomerHome() {
	const [complaints, setComplaints] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [showPinned, setShowPinned] = useState(false);
	const [pinnedIds, setPinnedIds] = useState(() => {
		// Persist pinned in localStorage for demo
		const saved = localStorage.getItem('pinnedComplaints');
		return saved ? JSON.parse(saved) : [];
	});

	useEffect(() => {
		setLoading(true);
		API.get('/complaints')
			.then(res => setComplaints(res.data.data || []))
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		localStorage.setItem('pinnedComplaints', JSON.stringify(pinnedIds));
	}, [pinnedIds]);

	const handlePin = (id) => {
		setPinnedIds(ids => ids.includes(id) ? ids.filter(pid => pid !== id) : [...ids, id]);
	};

	// Normalize complaints so every row has an id (use DB id or fallback to complaint_id)
	const normalizedComplaints = complaints.map(c => ({
		...c,
		id: c.id ?? c.complaint_id
	}));
	const filtered = normalizedComplaints.filter(c => {
		if (showPinned && !pinnedIds.includes(c.id)) return false;
		if (search && !(
			c.title?.toLowerCase().includes(search.toLowerCase()) ||
			c.complaint_id?.toLowerCase().includes(search.toLowerCase()) ||
			c.status?.toLowerCase().includes(search.toLowerCase())
		)) return false;
		return true;
	});

	const columns = [
		{ key: 'complaint_id', label: 'Complaint ID' },
		{ key: 'title', label: 'Title' },
		{ key: 'status', label: 'Status' },
		{ key: 'priority', label: 'Priority' },
		{ key: 'category', label: 'Category' },
		{ key: 'created_at', label: 'Created' },
		   {
			   key: 'pin',
			   label: 'Pin',
			   render: (_value, row) => (
				   <button
					   title={pinnedIds.includes(row.id) ? 'Unpin' : 'Pin'}
					   onClick={e => { e.stopPropagation(); handlePin(row.id); }}
					   className={pinnedIds.includes(row.id) ? 'text-yellow-500' : 'text-gray-400'}
				   >
					   {pinnedIds.includes(row.id) ? '★' : '☆'}
				   </button>
			   )
		   }
	];

	return (
		<div className="p-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
				<h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
				<div className="flex gap-2 items-center">
					<input
						type="text"
						placeholder="Search complaints..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="border px-3 py-2 rounded"
					/>
					<label className="flex items-center gap-1 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={showPinned}
							onChange={e => setShowPinned(e.target.checked)}
							className="accent-yellow-500"
						/>
						<span>Pinned only</span>
					</label>
				</div>
			</div>
			{loading ? (
				<Loading />
			) : (
				<DataTable
					data={filtered}
					columns={columns}
					loading={loading}
					emptyMessage="No complaints found."
					searchable={false}
				/>
			)}
		</div>
	);
}
