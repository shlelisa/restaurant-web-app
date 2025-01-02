import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import supabase from '../../../config/supabaseClient';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', usersData.map(user => user.id));

      if (profilesError) throw profilesError;

      // Combine users with their profiles
      const usersWithProfiles = usersData.map(user => ({
        ...user,
        profile: profilesData.find(profile => profile.user_id === user.id),
        fullName: (() => {
          const profile = profilesData.find(p => p.user_id === user.id);
          return profile ? 
            `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
            'N/A';
        })()
      }));

      setUsers(usersWithProfiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Users load gochuu hin dandeenye');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.fullName.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Handle delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Dhuguma user kana balleessuu barbaadduu?')) return;

    try {
      // First delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Then delete from users
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;

      // Refresh the users list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('User balleessuu hin dandeenye');
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    // Basic email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || !re.test(email)) {
      return false;
    }

    // Check for basic rules
    const invalidPatterns = [
      /\.{2,}/,            // Multiple dots
      /\s/,                // Whitespace
      /[<>()[\]\\,;:]/     // Special characters not allowed in email
    ];

    return !invalidPatterns.some(pattern => pattern.test(email));
  };

  const validatePhone = (phone) => {
    const re = /^\+251[0-9]{9}$/;  // Format: +251xxxxxxxxx
    return re.test(phone);
  };

  const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  // Validate form data
  const validateForm = (formData) => {
    const errors = {};

    // Validate first name
    const firstName = formData.get('first_name');
    if (!validateName(firstName)) {
      errors.first_name = 'Maaloo maqaa sirrii galchaa (harrufi qofa)';
    }

    // Validate last name
    const lastName = formData.get('last_name');
    if (!validateName(lastName)) {
      errors.last_name = 'Maaloo maqaa abbaa sirrii galchaa (harrufi qofa)';
    }

    // Validate email with specific error messages
    const email = formData.get('email');
    if (!email) {
      errors.email = 'Email dirreessi hin duwwaa ta\'uu hin qabu';
    } else if (!validateEmail(email)) {
      errors.email = 'Email sirrii miti. Fakkeenyaaf: name@gmail.com';
    }

    // Validate phone
    const phone = formData.get('phone');
    if (!validatePhone(phone)) {
      errors.phone = 'Lakkoofsi bilbilaa sirrii miti. Fakkeenya: +251911234567';
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);
    
    const formData = new FormData(e.target);
    
    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const userData = {
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        status: 'active'
      };

      const profileData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        language: formData.get('language')
      };

      let error;
      if (editingUser) {
        // Update existing user
        const { error: userError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);

        if (userError) throw userError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', editingUser.id);

        error = profileError;
      } else {
        // Create new user with default password
        const defaultPassword = '123456'; // You should change this in production
        userData.password_hash = defaultPassword; // In production, hash this password

        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (userError) throw userError;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ ...profileData, user_id: newUser.id }]);

        error = profileError;
      }

      if (error) throw error;

      // Reset form and refresh data
      setShowAddModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('User save gochuu hin dandeenye');
    }
  };

  // Add sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested profile properties
    if (sortField === 'fullName') {
      aValue = a.fullName.toLowerCase();
      bValue = b.fullName.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Barbaadi..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            <FaUserPlus /> User Haaraa
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('fullName')} className="sortable">
                  Maqaa {sortField === 'fullName' && (
                    <span className={`sort-arrow ${sortDirection}`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {sortField === 'email' && (
                    <span className={`sort-arrow ${sortDirection}`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('phone')} className="sortable">
                  Phone {sortField === 'phone' && (
                    <span className={`sort-arrow ${sortDirection}`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('role')} className="sortable">
                  Role {sortField === 'role' && (
                    <span className={`sort-arrow ${sortDirection}`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`role ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.status}`}>
                      {user.status === 'active' ? <FaCheck /> : <FaTimes />}
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingUser(user);
                          setShowAddModal(true);
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-results">
                    Users hin argamne
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={editingUser?.profile?.first_name}
                  className={validationErrors.first_name ? 'error' : ''}
                  required
                />
                {validationErrors.first_name && (
                  <span className="error-text">{validationErrors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={editingUser?.profile?.last_name}
                  className={validationErrors.last_name ? 'error' : ''}
                  required
                />
                {validationErrors.last_name && (
                  <span className="error-text">{validationErrors.last_name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser?.email}
                  className={validationErrors.email ? 'error' : ''}
                  required
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingUser?.phone}
                  className={validationErrors.phone ? 'error' : ''}
                  placeholder="+251911234567"
                  required
                />
                {validationErrors.phone && (
                  <span className="error-text">{validationErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role"
                  defaultValue={editingUser?.role || 'customer'}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Language</label>
                <select 
                  name="language"
                  defaultValue={editingUser?.profile?.language || 'or'}
                  required
                >
                  <option value="or">Afaan Oromoo</option>
                  <option value="am">Amharic</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingUser ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 