import React, { useState, useEffect } from 'react';
import { 
  FaStore, FaCreditCard, FaBell, FaCog, FaGlobe, 
  FaPhone, FaMapMarkerAlt, FaSave, FaImage 
} from 'react-icons/fa';
import supabase from '../../../config/supabaseClient';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [settings, setSettings] = useState({
    restaurant: {
      name: "Nyaata Aadaa",
      description: "Nyaata Aadaa Oromoo",
      phone: "+251911234567",
      address: "Finfinne, Ethiopia",
      openHours: "8:00 AM - 10:00 PM",
      logo: null
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptMobile: true,
      telebirr: "+251911234567",
      cbebirr: "+251911234567",
      minOrderAmount: 100
    },
    notifications: {
      orderConfirmation: true,
      orderStatus: true,
      promotions: false,
      email: true,
      sms: true,
      pushNotifications: false
    },
    system: {
      language: 'or',
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      autoAcceptOrders: false,
      orderTimeout: 30,
      maxOrdersPerHour: 50
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        // Set settings directly since data is already in JSONB format
        setSettings({
          restaurant: data.restaurant || settings.restaurant,
          payment: data.payment || settings.payment,
          notifications: data.notifications || settings.notifications,
          system: data.system || settings.system
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Settings load gochuu hin dandeenye');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // Get existing settings first
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let updateData = {};

      // Handle different sections based on activeTab
      switch (activeTab) {
        case 'restaurant':
          // Handle logo upload if exists
          let logoUrl = settings.restaurant.logo;
          if (logoFile) {
            const fileName = `${Date.now()}-${logoFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('settings')
              .upload(`logo/${fileName}`, logoFile, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('settings')
              .getPublicUrl(`logo/${fileName}`);

            logoUrl = publicUrl;
          }

          updateData = {
            restaurant: {
              ...settings.restaurant,
              logo: logoUrl,
              category: 'restaurant'
            }
          };
          break;

        case 'payment':
          updateData = {
            payment: {
              acceptCash: settings.payment.acceptCash,
              acceptCard: settings.payment.acceptCard,
              acceptMobile: settings.payment.acceptMobile,
              telebirr: settings.payment.telebirr,
              cbebirr: settings.payment.cbebirr,
              minOrderAmount: settings.payment.minOrderAmount,
              category: 'payment'
            }
          };
          break;

        case 'notifications':
          updateData = {
            notifications: {
              orderConfirmation: settings.notifications.orderConfirmation,
              orderStatus: settings.notifications.orderStatus,
              promotions: settings.notifications.promotions,
              email: settings.notifications.email,
              sms: settings.notifications.sms,
              pushNotifications: settings.notifications.pushNotifications,
              category: 'notifications'
            }
          };
          break;

        case 'system':
          updateData = {
            system: {
              language: settings.system.language,
              currency: settings.system.currency,
              timezone: settings.system.timezone,
              autoAcceptOrders: settings.system.autoAcceptOrders,
              orderTimeout: settings.system.orderTimeout,
              maxOrdersPerHour: settings.system.maxOrdersPerHour,
              category: 'system'
            }
          };
          break;

        default:
          throw new Error('Invalid settings section');
      }

      let error;
      if (existingSettings?.id) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('settings')
          .update(updateData)
          .eq('id', existingSettings.id);
        
        error = updateError;
      } else {
        // Insert new settings with all sections
        const { error: insertError } = await supabase
          .from('settings')
          .insert([{
            ...settings,
            ...updateData
          }]);
        
        error = insertError;
      }

      if (error) throw error;

      // Refresh settings and show success message
      await fetchSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error(`Error saving ${activeTab} settings:`, err);
      setError(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings save gochuu hin dandeenye: ` + 
        (err.message || err.error_description || 'Unknown error'));
    }
  };

  const renderRestaurantSettings = () => (
    <div className="settings-section">
      <h2><FaStore /> Restaurant Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Restaurant Name *</label>
          <input
            type="text"
            value={settings.restaurant.name}
            onChange={(e) => handleInputChange('restaurant', 'name', e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={settings.restaurant.description}
            onChange={(e) => handleInputChange('restaurant', 'description', e.target.value)}
            required
            minLength={10}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label>Logo</label>
          <div className="logo-upload">
            {(logoPreview || settings.restaurant.logo) && (
              <img 
                src={logoPreview || settings.restaurant.logo} 
                alt="Restaurant Logo" 
                className="logo-preview"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            value={settings.restaurant.phone}
            onChange={(e) => handleInputChange('restaurant', 'phone', e.target.value)}
            required
            pattern="\+251[0-9]{9}"
            placeholder="+251911234567"
          />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            value={settings.restaurant.address}
            onChange={(e) => handleInputChange('restaurant', 'address', e.target.value)}
            required
            minLength={5}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>Open Hours *</label>
          <input
            type="text"
            value={settings.restaurant.openHours}
            onChange={(e) => handleInputChange('restaurant', 'openHours', e.target.value)}
            required
            placeholder="8:00 AM - 10:00 PM"
          />
        </div>

        <button type="submit" className="save-btn">
          <FaSave /> Save Changes
        </button>
      </form>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-section">
      <h2><FaCreditCard /> Payment Methods</h2>
      <form onSubmit={handleSubmit}>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.payment.acceptCash}
              onChange={(e) => handleInputChange('payment', 'acceptCash', e.target.checked)}
            />
            Accept Cash
          </label>
        </div>

        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.payment.acceptCard}
              onChange={(e) => handleInputChange('payment', 'acceptCard', e.target.checked)}
            />
            Accept Card
          </label>
        </div>

        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.payment.acceptMobile}
              onChange={(e) => handleInputChange('payment', 'acceptMobile', e.target.checked)}
            />
            Accept Mobile Money
          </label>
        </div>

        <div className="form-group">
          <label>TeleBirr Number</label>
          <input
            type="tel"
            value={settings.payment.telebirr}
            onChange={(e) => handleInputChange('payment', 'telebirr', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>CBE Birr Number</label>
          <input
            type="tel"
            value={settings.payment.cbebirr}
            onChange={(e) => handleInputChange('payment', 'cbebirr', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Minimum Order Amount</label>
          <input
            type="number"
            value={settings.payment.minOrderAmount}
            onChange={(e) => handleInputChange('payment', 'minOrderAmount', parseInt(e.target.value))}
          />
        </div>

        <button type="submit" className="save-btn">
          <FaSave /> Save Changes
        </button>
      </form>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h2><FaBell /> Notifications</h2>
      <form onSubmit={handleSubmit}>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.orderConfirmation}
              onChange={(e) => handleInputChange('notifications', 'orderConfirmation', e.target.checked)}
            />
            Order Confirmation
          </label>
        </div>

        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.orderStatus}
              onChange={(e) => handleInputChange('notifications', 'orderStatus', e.target.checked)}
            />
            Order Status Updates
          </label>
        </div>

        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.promotions}
              onChange={(e) => handleInputChange('notifications', 'promotions', e.target.checked)}
            />
            Promotional Messages
          </label>
        </div>

        <div className="notification-channels">
          <h3>Notification Channels</h3>
          
          <div className="toggle-group">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
              />
              Email
            </label>
          </div>

          <div className="toggle-group">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => handleInputChange('notifications', 'sms', e.target.checked)}
              />
              SMS
            </label>
          </div>

          <div className="toggle-group">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
              />
              Push Notifications
            </label>
          </div>
        </div>

        <button type="submit" className="save-btn">
          <FaSave /> Save Changes
        </button>
      </form>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h2><FaCog /> System Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Language</label>
          <select
            value={settings.system.language}
            onChange={(e) => handleInputChange('system', 'language', e.target.value)}
          >
            <option value="or">Afaan Oromoo</option>
            <option value="am">Amharic</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <select
            value={settings.system.currency}
            onChange={(e) => handleInputChange('system', 'currency', e.target.value)}
          >
            <option value="ETB">Ethiopian Birr (ETB)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            value={settings.system.timezone}
            onChange={(e) => handleInputChange('system', 'timezone', e.target.value)}
          >
            <option value="Africa/Addis_Ababa">Addis Ababa</option>
          </select>
        </div>

        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.system.autoAcceptOrders}
              onChange={(e) => handleInputChange('system', 'autoAcceptOrders', e.target.checked)}
            />
            Auto Accept Orders
          </label>
        </div>

        <div className="form-group">
          <label>Order Timeout (minutes)</label>
          <input
            type="number"
            value={settings.system.orderTimeout}
            onChange={(e) => handleInputChange('system', 'orderTimeout', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Maximum Orders Per Hour</label>
          <input
            type="number"
            value={settings.system.maxOrdersPerHour}
            onChange={(e) => handleInputChange('system', 'maxOrdersPerHour', parseInt(e.target.value))}
          />
        </div>

        <button type="submit" className="save-btn">
          <FaSave /> Save Changes
        </button>
      </form>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-container">
        <div className="settings-nav">
          <button
            className={`nav-btn ${activeTab === 'restaurant' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurant')}
          >
            <FaStore /> Restaurant
          </button>
          <button
            className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <FaCreditCard /> Payment
          </button>
          <button
            className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>
          <button
            className={`nav-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <FaCog /> System
          </button>
        </div>

        <div className="settings-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Settings saved successfully!</div>}
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === 'restaurant' && renderRestaurantSettings()}
              {activeTab === 'payment' && renderPaymentSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'system' && renderSystemSettings()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 