import React from 'react';

const UsersManagement = ({ users }) => {
  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-white border-collapse">
          <thead>
            <tr className="border-b border-red-500">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.users_id} className="hover:bg-gray-800">
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{u.u_name}</td>
                <td className="py-2 px-4">{u.u_email}</td>
                <td className="py-2 px-4 text-red-500 capitalize">{u.u_role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;