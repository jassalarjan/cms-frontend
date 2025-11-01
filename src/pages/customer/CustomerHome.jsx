

import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loading from '../../components/Loading';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

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
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [selectedComplaint, setSelectedComplaint] = useState(null);
	const [updateForm, setUpdateForm] = useState({
		status: '',
		comments: ''
	});
	const [updating, setUpdating] = useState(false);

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

	const handleUpdateComplaint = (complaint) => {
		setSelectedComplaint(complaint);
		setUpdateForm({
			status: complaint.status || '',
			comments: ''
		});
		setShowUpdateModal(true);
	};

	const handleUpdateSubmit = async (e) => {
		e.preventDefault();
		if (!updateForm.status.trim()) {
			toast.error('Please select a status');
			return;
		}

		setUpdating(true);
		try {
			await API.patch(`/complaints/${selectedComplaint.id}`, {
				status: updateForm.status,
				customer_comments: updateForm.comments
			});

			// Update local state
			setComplaints(complaints.map(c =>
				c.id === selectedComplaint.id
					? { ...c, status: updateForm.status }
					: c
			));

			setShowUpdateModal(false);
			setSelectedComplaint(null);
			toast.success('Complaint updated successfully');
		} catch (err) {
			toast.error('Failed to update complaint');
		} finally {
			setUpdating(false);
		}
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
		   },
		   {
			   key: 'actions',
			   label: 'Actions',
			   render: (_value, row) => (
				   <button
					   onClick={() => handleUpdateComplaint(row)}
					   className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
				   >
					   Update
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

			{/* Update Complaint Modal */}
			<Modal
				isOpen={showUpdateModal}
				onClose={() => setShowUpdateModal(false)}
				title="Update Complaint Status"
				size="lg"
			>
				{selectedComplaint && (
					<form onSubmit={handleUpdateSubmit} className="space-y-6">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-semibold text-gray-900 mb-2">Complaint Details</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">ID:</span> {selectedComplaint.complaint_id}
								</div>
								<div>
									<span className="font-medium">Title:</span> {selectedComplaint.title}
								</div>
								<div>
									<span className="font-medium">Current Status:</span> {selectedComplaint.status}
								</div>
								<div>
									<span className="font-medium">Priority:</span> {selectedComplaint.priority}
								</div>
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-800 mb-2">
								Update Status <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3">
									<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<select
									value={updateForm.status}
									onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
									className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900"
									required
								>
									<option value="">Select Status</option>
									<option value="PENDING">⏳ Pending</option>
									<option value="IN_PROGRESS">🔄 In Progress</option>
									<option value="RESOLVED">✅ Resolved</option>
									<option value="CLOSED">🔒 Closed</option>
									<option value="ESCALATED">⚠️ Escalated</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-800 mb-2">
								Comments/Response (for Admin)
							</label>
							<textarea
								value={updateForm.comments}
								onChange={(e) => setUpdateForm({...updateForm, comments: e.target.value})}
								placeholder="Add any comments or additional information for the administrator..."
								rows={4}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
							/>
							<p className="text-xs text-gray-500 mt-1">Optional: This will be visible to administrators only</p>
						</div>

						<div className="flex justify-end space-x-4 pt-4">
							<button
								type="button"
								onClick={() => setShowUpdateModal(false)}
								className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
								disabled={updating}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={updating}
							>
								{updating ? 'Updating...' : 'Update Complaint'}
							</button>
						</div>
					</form>
				)}
			</Modal>
		</div>
	);
}
