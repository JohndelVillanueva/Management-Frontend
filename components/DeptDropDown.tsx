// import { useState, useEffect } from 'react';
// import { BuildingOfficeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// interface Department {
//   id: number;
//   name: string;
// }

// interface DepartmentDropdownProps {
//   value: number | null;
//   onChange: (department_id: number | null) => void;
// }

// export default function DepartmentDropdown({ value, onChange }: DepartmentDropdownProps) {
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const response = await fetch('/getDepartment');
//         if (!response.ok) throw new Error('Failed to fetch departments');
//         const result = await response.json();
//         setDepartments(result.data); // ✅ correct extraction
//       } catch (error) {
//         console.error('Error fetching departments:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   return (
//     <div>
//       <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
//         Department
//       </label>
//       <div className="relative rounded-lg shadow-sm">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
//         </div>
//         <select
//           id="department_id"
//           name="department_id"
//           required
//           value={value ?? ''}
//           onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
//           className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
//         >
//           {loading ? (
//             <option disabled>Loading departments...</option>
//           ) : (
//             <>
//               <option value="">Select a department</option>
//               {departments.map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </>
//           )}
//         </select>
//         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//           <ChevronDownIcon className="h-4 w-4 text-gray-400" />
//         </div>
//       </div>
//     </div>
//   );
// }
