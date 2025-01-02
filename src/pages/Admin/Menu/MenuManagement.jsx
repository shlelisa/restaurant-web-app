import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaImage } from 'react-icons/fa';
import supabase from '../../../config/supabaseClient';
import './MenuManagement.css';

const MenuManagement = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch categories and menu items
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setCategories([{ id: 'all', name: 'Hunda' }, ...data]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Categories load gochuu hin dandeenye');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name');

      if (activeCategory !== 'all') {
        query = query.eq('category_id', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Menu items load gochuu hin dandeenye');
    } finally {
      setLoading(false);
    }
  };

  // Validate menu item
  const validateMenuItem = (item) => {
    const errors = [];
    
    if (!item.name?.trim()) {
      errors.push('Maaloo maqaa galchaa');
    }
    
    if (!item.category_id) {
      errors.push('Maaloo category filaadhaa');
    }
    
    if (!item.price || item.price <= 0) {
      errors.push('Maaloo gatii sirrii galchaa');
    }
    
    if (!item.description?.trim()) {
      errors.push('Maaloo ibsa galchaa');
    }

    return errors;
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Upload image to storage
  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Add this function to copy image file
  const copyImageToPublicFolder = async (file) => {
    try {
      // Create a Blob from the file
      const blob = new Blob([file], { type: file.type });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      
      // Set the download path to public/images/menu
      link.setAttribute('download', `${process.env.PUBLIC_URL}/images/menu/${file.name}`);
      
      // Trigger download (which saves to public folder)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error copying image:', error);
      return false;
    }
  };

  // Handle add/edit menu item
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const menuItem = {
        name: formData.get('name'),
        category_id: formData.get('category_id'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        is_available: true
      };

      // Validate the menu item
      const errors = validateMenuItem(menuItem);
      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }

      // Handle image if exists
      if (imageFile) {
        // First copy the image to public folder
        const copied = await copyImageToPublicFolder(imageFile);
        if (!copied) {
          throw new Error('Image copy failed');
        }
        menuItem.image_url = `/images/menu/${imageFile.name}`;
      }

      let error;
      if (editingItem) {
        // If updating, only update changed fields
        const updates = {};
        
        // Compare each field and only include changed ones
        if (menuItem.name !== editingItem.name) updates.name = menuItem.name;
        if (menuItem.category_id !== editingItem.category_id) updates.category_id = menuItem.category_id;
        if (menuItem.price !== editingItem.price) updates.price = menuItem.price;
        if (menuItem.description !== editingItem.description) updates.description = menuItem.description;
        
        // Only include image_url if new image was uploaded
        if (imageFile) updates.image_url = menuItem.image_url;

        const { error: updateError } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', editingItem.id);
        
        error = updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert([menuItem]);
        
        error = insertError;
      }

      if (error) throw error;

      // Reset form and state
      setShowAddModal(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview(null);
      fetchMenuItems();
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError('Menu item save gochuu hin dandeenye');
    }
  };

  // Handle delete menu item
  const handleDelete = async (id) => {
    if (!window.confirm('Dhuguma menu item kana balleessuu barbaadduu?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Menu item balleessuu hin dandeenye');
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchMenuItems();
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Availability update gochuu hin dandeenye');
    }
  };

  // Add search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.categories?.name.toLowerCase().includes(searchLower)
    );
  });

  // Add sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort menu items
  const sortedMenuItems = [...filteredMenuItems].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle special cases
    if (sortField === 'category') {
      aValue = a.categories?.name?.toLowerCase() || '';
      bValue = b.categories?.name?.toLowerCase() || '';
    } else if (sortField === 'price') {
      aValue = parseFloat(a.price);
      bValue = parseFloat(b.price);
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="menu-management">
      <div className="menu-header">
        <h1>Menu Management</h1>
        <div className="header-actions">
          {/* Add search input */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Barbaadi..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button className="add-item-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Nyaata Haaraa
          </button>
        </div>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Fakkii</th>
              <th onClick={() => handleSort('name')} className="sortable">
                Maqaa {sortField === 'name' && (
                  <span className={`sort-arrow ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category {sortField === 'category' && (
                  <span className={`sort-arrow ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Gatii {sortField === 'price' && (
                  <span className={`sort-arrow ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('description')} className="sortable">
                Ibsa {sortField === 'description' && (
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
            {sortedMenuItems.map(item => (
              <tr key={item.id}>
                <td>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="menu-item-image"
                    />
                  ) : (
                    <div className="no-image">
                      <FaImage />
                    </div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.categories?.name}</td>
                <td>ETB {item.price}</td>
                <td>{item.description}</td>
                <td>
                  <button 
                    className={`status-toggle ${item.is_available ? 'active' : ''}`}
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                  >
                    {item.is_available ? <FaToggleOn /> : <FaToggleOff />}
                    <span>{item.is_available ? 'Available' : 'Unavailable'}</span>
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingItem(item);
                        setShowAddModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMenuItems.length === 0 && (
              <tr>
                <td colSpan="7" className="no-results">
                  Menu items hin argamne
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-group">
                <label>Maqaa</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category_id"
                  defaultValue={editingItem?.category_id}
                  required
                >
                  <option value="">Category filadhu</option>
                  {categories
                    .filter(cat => cat.id !== 'all')
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="form-group">
                <label>Gatii (ETB)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  defaultValue={editingItem?.price}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ibsa</label>
                <textarea
                  name="description"
                  defaultValue={editingItem?.description}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fakkii</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="image-preview"
                  />
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    setImageFile(null);
                    setImagePreview(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement; 