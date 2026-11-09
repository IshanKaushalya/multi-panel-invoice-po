import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Building, Percent } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Settings = () => {
  const [settingsData, setSettingsData] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    vatRate: 18,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        if (response.data) {
          setSettingsData(response.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({
      ...prev,
      [name]: name === "vatRate" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/settings`, settingsData);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div
      className="page-container"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <div className="page-header">
        <h1>System Settings</h1>
        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
          Manage your global business details and financial variables.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* COMPANY PROFILE SECTION */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "0.5rem",
            }}
          >
            <Building size={20} color="#4b5563" />
            <h3 style={{ margin: 0 }}>Company Profile</h3>
          </div>

          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={settingsData.companyName}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Company Address</label>
              <textarea
                name="companyAddress"
                value={settingsData.companyAddress}
                onChange={handleChange}
                rows="3"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  resize: "vertical",
                }}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="companyPhone"
                value={settingsData.companyPhone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="companyEmail"
                value={settingsData.companyEmail}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL SETTINGS SECTION */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "0.5rem",
            }}
          >
            <Percent size={20} color="#4b5563" />
            <h3 style={{ margin: 0 }}>Financial Settings</h3>
          </div>

          <div className="form-group" style={{ maxWidth: "300px" }}>
            <label>Default VAT Rate (%)</label>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="number"
                name="vatRate"
                min="0"
                max="100"
                step="0.1"
                value={settingsData.vatRate}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              />
              <span style={{ fontWeight: "bold", color: "#6b7280" }}>%</span>
            </div>
            <small
              style={{
                color: "#6b7280",
                display: "block",
                marginTop: "0.25rem",
              }}
            >
              This rate will be used globally when generating new Invoices and
              POs.
            </small>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
          >
            <Save size={20} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
