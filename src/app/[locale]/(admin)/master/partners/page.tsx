"use client";

import { useState } from 'react';

export default function PartnersPage() {
  const [partners] = useState([
    { id: 1, code: 'BP001', name: 'Partner Company A', type: 'buyer', contact: 'John Doe', phone: '+1234567890' },
    { id: 2, code: 'BP002', name: 'Partner Company B', type: 'seller', contact: 'Jane Smith', phone: '+0987654321' },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Partners</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Partner
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-b">
                <td className="px-6 py-4 whitespace-nowrap">{partner.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{partner.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    partner.type === 'buyer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {partner.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{partner.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap">{partner.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}