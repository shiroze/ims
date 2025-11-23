"use client";

import { useState } from 'react';

export default function DeliveryOrdersPage() {
  const [deliveries] = useState([
    { 
      id: 1, 
      number: 'DO001', 
      date: '2025-01-17', 
      soNumber: 'SO001',
      customer: 'Customer A',
      status: 'delivered'
    },
    { 
      id: 2, 
      number: 'DO002', 
      date: '2025-01-18', 
      soNumber: 'SO002',
      customer: 'Customer B',
      status: 'pending'
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delivery Orders</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Delivery Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b">
                <td className="px-6 py-4 whitespace-nowrap">{delivery.number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{delivery.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{delivery.soNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{delivery.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {delivery.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
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